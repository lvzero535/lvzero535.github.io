# Github Actions (或本地) 使用RSA登录云服务器

## 云服务器准备好 SSH 登录权限

假设你用的是 Ubuntu 服务器，用户名为 ubuntu，服务器 IP 为 123.123.123.123

## 创建SSH密钥对

在本地电脑终端（可以使用git的bash）中运行以下命令创建SSH密钥对：

```bash
ssh-keygen -t rsa -b 4096 -C "github-actions-deploy"
```

- `-C "注释"` -C 后面添加的是注释
- 按照提示，输入密钥对的文件名（默认即可）和密码（建议设置密码）
- 密钥对创建完成后，会在本地电脑的 `~/.ssh` 目录下生成两个文件：`id_rsa`（私钥）和 `id_rsa.pub`（公钥）

- 公钥（~/.ssh/id_rsa.pub）👉 复制到服务器
- 私钥（~/.ssh/id_rsa）👉 保存到 GitHub secrets

## 添加公钥到服务器

在本地电脑终端（可以使用git的bash）中运行以下命令添加公钥到服务器：

```bash
cat ~/.ssh/id_rsa.pub | ssh ubuntu@123.123.123.123 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

确保本地电脑无密码登录：

```bash
ssh -i ~/.ssh/id_rsa ubuntu@123.123.123.123
```

- `-i ~/.ssh/id_rsa` 👉 私钥文件路径
- `ubuntu@123.123.123.123` 👉 服务器用户名@服务器IP

## 将私钥保存为 GitHub Secret

- 到 GitHub 项目 → Settings → Secrets → New repository secret：
  - DEPLOY_KEY → 粘贴 id_rsa 的内容（私钥）
- 可选：也添加下面这些 Secret 以便配置灵活
  - REMOTE_HOST → 123.123.123.123
  - REMOTE_USER → ubuntu
  - DEPLOY_PATH → /home/ubuntu/your-project-path

## 编写部署 Action（workflow 文件）

在仓库中创建一个 `.github/workflows/deploy.yml` 文件，内容如下：

```yaml
name: Deploy to Server

on:
  push:
    branches:
      - main  # 或你使用的部署分支

jobs:
  deploy:
    name: Deploy via SSH
    runs-on: ubuntu-latest

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup SSH key
        run: |
          mkdir -p ~/.ssh
          echo "${{ secrets.DEPLOY_KEY }}" > ~/.ssh/id_rsa
          chmod 600 ~/.ssh/id_rsa
          ssh-keyscan -H ${{ secrets.REMOTE_HOST }} >> ~/.ssh/known_hosts

      - name: Run deployment commands
        run: |
          ssh ${{ secrets.REMOTE_USER }}@${{ secrets.REMOTE_HOST }} << 'EOF'
            cd ${{ secrets.DEPLOY_PATH }}
          EOF
```

## 无法使用密钥登录退回密码登录的排查方法

### 1. 检查私钥权限

SSH 要求私钥文件权限非常严格，如果权限不对，会拒绝使用私钥登录。

```bash
chmod 600 ~/.ssh/id_rsa
chmod 700 ~/.ssh
```

- ~/.ssh 文件夹必须是 700
- 私钥（id_rsa）必须是 600
- 公钥（id_rsa.pub）可以是 644

### 2. 确认用的私钥正确

有时本地配置了多个私钥，SSH 可能没用你想要的那个。
直接指定私钥试试：

```bash
ssh -i ~/.ssh/id_rsa ubuntu@123.123.123.123
```

查看当前使用的私钥：

```bash
ssh -v ubuntu@123.123.123.123
```

（会打印一大堆日志，搜索 Offering public key 看它用了哪个）

### 3. 确认公钥放到服务器正确位置

在云服务器上，公钥必须放在：

```bash
/home/用户名/.ssh/authorized_keys
```

并且权限要正确：

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

### 4. 检查 sshd 配置

如果服务器端的 sshd_config 没开公钥认证，就算你配置了也会回退到密码模式。
编辑 /etc/ssh/sshd_config 确认：

```txt
PubkeyAuthentication yes
PasswordAuthentication yes   # 或 no（如果想禁用密码）
AuthorizedKeysFile .ssh/authorized_keys
```

改完后重启 SSH：

```bash
sudo systemctl restart sshd
```

## authorized_keys

作用：

- 服务器端用于保存允许连接的客户端的 公钥列表。
- 当客户端使用对应的私钥发起连接时，服务器会从 authorized_keys 中查找匹配的公钥来验证身份。
- 相当于“门卫的白名单”：谁的钥匙可以开这道门。

位置：

- 一般位于服务器的用户目录下：

  ```bash
  /home/用户名/.ssh/authorized_keys
  ```

- 权限要求较严格：

```bash
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys
```

流程：

1. 你把本地的 公钥 (id_rsa.pub) 上传到服务器的 authorized_keys。
2. 当你 ssh user@server 时，SSH 会用私钥做签名，服务器用公钥验证。
3. 验证成功就免密登录。

## known_hosts

作用：

- 客户端用于保存已连接过的服务器的 主机指纹（host key）
- 主要防止“中间人攻击”（Man-in-the-Middle Attack）。
- 相当于“通讯录的来电显示”：你记住了对方的号码，下次来电才能确认是同一个人。

位置：

- 一般在客户端的用户目录下：

```bash
~/.ssh/known_hosts
```

也可能有系统级的 /etc/ssh/ssh_known_hosts。

流程：

1. 第一次连接到服务器时，SSH 会提示：

```bash
The authenticity of host 'example.com (192.168.1.10)' can't be established.
ED25519 key fingerprint is SHA256:xxxxx.
Are you sure you want to continue connecting (yes/no)?
```

2. 你输入 yes，SSH 就把这个指纹写进 known_hosts。
3. 你输入 yes，SSH 就把这个指纹写进 known_hosts。

WARNING: REMOTE HOST IDENTIFICATION HAS CHANGED!


| 文件                | 所在机器 | 作用  | 存的内容    | 主要用途             |
| ----------------- | ---- | --- | ------- | ---------------- |
| `authorized_keys` | 服务器端 | 谁能来 | 客户端公钥   | 控制允许哪些客户端免密登录    |
| `known_hosts`     | 客户端  | 信谁  | 服务器公钥指纹 | 防止连接到假服务器（中间人攻击） |
