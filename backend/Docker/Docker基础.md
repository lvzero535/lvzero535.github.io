# Docker基础

## 前言

新项目使用K8S部署，前端需要打Docker镜像，这里记录下学习Docker的笔记。

## 安装Docker

### 安装前删除旧版本

> sudo apt-get remove docker docker-engine docker.io containerd runc

### 安装依赖

> **sudo** **apt-get install** \
>   apt-transport-https \
>   ca-certificates \
>   curl \
>   gnupg-agent \
>   software-properties-common

### 添加 Docker 的科大 GPG 密钥

> curl -fsSL https://mirrors.ustc.edu.cn/docker-ce/linux/ubuntu/gpg | sudo apt-key add -

### 添加仓库

> **sudo** add-apt-repository \
>   "deb [arch=amd64] https://mirrors.ustc.edu.cn/docker-ce/linux/ubuntu/ **\** $(lsb_release -cs) **\
> ** stable"

### 安装

```shell
sudo apt-get update
sudo apt-get install docker-ce docker-ce-cli containerd.io
```

### 错误修改

没有使用`sudo` 时会出现下面的错，是当前用户不在docker组里面

```shell
ubuntu@VM-0-8-ubuntu:~$ docker ps
Got permission denied while trying to connect to the Docker daemon socket at unix:///var/run/docker.sock: Get http://%2Fvar%2Frun%2Fdocker.sock/v1.24/containers/json: dial unix /var/run/docker.sock: connect: permission denied

# 目录权限
ubuntu@VM-0-8-ubuntu:/var/run$ ls -l | grep docker
drwx------  8 root root    180 Apr 16 23:39 docker
-rw-r--r--  1 root root      4 Apr 16 23:39 docker.pid
srw-rw----  1 root docker    0 Apr 16 22:06 docker.sock
```

可以添加当前用户到docker组

```shell
sudo gpasswd -a ubuntu docker
sudo newgrp docker
```

## 配置镜像加速

```shell
# 创建目录
sudo mkdir -p /etc/docker
#加速镜像文件
#在/etc/docker/daemon.json（没有就创建）中加入以下内容
{
	"registry-mirrors": ["https://docker.mirrors.ustc.edu.cn/"]
}

#重启
sudo systemctl daemon-reload
sudo systemctl restart docker
```



## 常用命令

### 镜像

#### **docker images** 查看所有镜像

```shell
-a --all # 列表所有镜像
-q --quiet # 只显示镜像IDs
```

#### **docker search** 搜索镜像

#### **docker pull** 下载镜像

```shell
docker pull [OPTIONS] NAME[:TAG|@DIGEST]
```

#### **docker rmi** 删除镜像

```shell
docker rmi -f 镜像ID #删除一个
docker rmi -f 镜像ID 镜像ID 镜像ID #删除多个
docker rmi -f $(docker images -aq) # 删除全部
```

### 容器

> 有镜像才有容器

#### **docker run** 运行容器

```shell
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
--name "容器名称"
-d 后台方式运行
-it	使用交互方式运行，进入容器查看内容
-p 指定容器的端口 -p 8080:8080
	-p ip:主机端口:容器端口
	-p 主机端口:容器端口
	-p 容器端口
	容器端口
-P	随机指定端口
--rm 退出删除容器

#运行进入 centos容器
#/bin/bash 通过bash交互
docker run -it centos /bin/bash
```

#### **docker ps** 查看容器

```shell
docker ps #查看当前运行的容器
	-a # 查看所有的容器
	-q # 只看容器ID
```



#### **退出容器**

```shell
exit #直接容器停止并退出，有服务不停止？
Ctrl + P + Q #容器不停止退出
```

#### **删除容器**

```shell
docker rm 容器ID # 删除指定容器，不能删除运行的容器，如果要删除 rm -f
docker rm -f $(docker ps -aq) #删除所有容器
```

#### **启动和停止容器**

```shell
docker start 容器ID	#启动容器
docker restart 容器ID	#重启容器
docker stop 容器ID	#停止当前正在运行的容器
docker kill 容器ID	#强制停止当前容器
```

### 常用命令

#### **后台启动容器**

```shell
#docker run -d 镜像名
docker run -d centos
# 问题docker ps，发现centos 停止了
# docker容器使用后台运行，就必要有一个前台进程，docker发现没有应用，就会自动停止。
# nginx，容器启动后，发现自己没有提供服务，就会立刻停止，就是没有程序了
```

#### **查看日志**

```shell
docker logs 容器ID
```

#### **查看容器中进程信息**

```shell
docker top 容器ID
```

#### **查看容器的元数据**

```shell
docker inspect 容器ID
```

#### **进入当前正在运行的容器**

```shell
#进入后台运行的容器
docker exec -it 容器ID /bin/bash
docker attach 容器ID
# docker exec	进入容器后开启一个新的终端，可以在里面操作（常用）
# docker attach	进入容器正在执行的终端，不会启动新的进程
```

#### **从容器内拷贝文件到主机**

```shell
# 容器在数据就在，不管它是否在运行
docker cp 容器ID:容器内路径 目的主机路径
docker cp 目的主机路径 器ID:容器内路径
```

#### **Commit 镜像** 

保存修改后的容器（保存当前容器的状态），可以通过`commit` 提交，获取一个镜像。

```shell
docker commit -a="davis" -m="add webapps" tomcat01 tomcat01:1.0
-a 作者
-m 提交信息
tomcat01 需要提交的容器名称或者ID
tomcat01:1.0 提交后的镜像名称和TAG
```

## 容器数据卷

容器不在了，容器中的数据也就不在了。容器之间可以数据共享，Dokcer产生的数据，同步到本地，这就是卷技术，目录的挂载，将容器内的目录，挂载到Linux上面。

同步后，容器停止了，修改主机目录还是可以同步到容器中的，也就是说容器还在，两个目录都是同步的。（双倍存储？）

```shell
docker run -v 主机目录:容器目录
#运行时通过 -v 参数挂载目录

#docker inspect 容器ID
Mounts: [{
	Source 主机目录
	Destination	容器目录
}]
```

### **具名和匿名挂载**

> 不是 `/` 开头的不是目录，是一个名称。
>
> 指定目录的，和容器目录同步。
>
> 不指定目录的，即是具名或是匿名挂载的，目录都在默认位置。 
>
> `/var/lib/docker/volumes/[具名|匿名（一串ID）]/_data`

```shell
# 只标明容器目录，没有写主机目录，是匿名挂载
# -v 容器目录
docker run -d -P --name nginx01 -v /etc/nginx nginx

# 具名挂载
# -v 名称:容器目录
docker run -d -P --name nginx02 -v jumin-nginx:/etc/nginx nginx

# 指定目录挂载
-v 主机目录:容器目录

docker volume ls #查看所有容器卷名称，匿名的是一串ID
#测试
ubuntu@VM-0-8-ubuntu:~$ docker volume ls
DRIVER    VOLUME NAME
local     9d86a4e875eeace95d596005eb971f23601931829c27c44298982387b2a82015
local     jumin-nginx

# 查看主机挂载目录 
docker volume inspect 具名
ubuntu@VM-0-8-ubuntu:~$ docker volume inspect jumin-nginx
[
    {
        "CreatedAt": "2021-04-18T00:36:16+08:00",
        "Driver": "local",
        "Labels": null,
        "Mountpoint": "/var/lib/docker/volumes/jumin-nginx/_data", #目录
        "Name": "jumin-nginx",
        "Options": null,
        "Scope": "local"
    }
]

-v *:容器目录:ro|rw
ro readonly	#只读
rw readwite	#可读可写 默认
# 这里的权限是针对容器内的，如添加了 ro， 容器内的目录文件不能修改，只能主机目录可以修改
```

### **dockerfile挂载**

```shell
#构建一个镜像
docker build -f dockerfile -t TAG . 

# Dockerfile
root@VM-0-8-ubuntu:~# cat dockerfile1 
FROM centos

VOLUME ["volume1", "volume2"] # 匿名挂载
CMD echo "----- end ----------"
CMD /bin/bash

# 测试 构建镜像
ubuntu@VM-0-8-ubuntu:~# docker build -f dockerfile1 -t test-volume:1.0 .
Sending build context to Docker daemon  22.53kB
Step 1/4 : FROM centos
 ---> 300e315adb2f
Step 2/4 : VOLUME ["volume1", "volume2"]
 ---> Running in 56534d91c58c
Removing intermediate container 56534d91c58c
 ---> 05ba6051fbd9
Step 3/4 : CMD echo "----- end ----------"
 ---> Running in d96e6d2d4b07
Removing intermediate container d96e6d2d4b07
 ---> 38da3ae27e42
Step 4/4 : CMD /bin/bash
 ---> Running in b932054aef8a
Removing intermediate container b932054aef8a
 ---> 7ee8ea118b21
Successfully built 7ee8ea118b21
Successfully tagged test-volume:1.0

# 运行构建好的镜像，多了两个挂载的目录
ubuntu@VM-0-8-ubuntu:~# docker run -it --name test01 test-volume:1.0 /bin/bash
[ubuntu@503db31694db /]# ls
bin  dev  etc  home  lib  lib64  lost+found  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var  volume1  volume2 #12

#查看主机挂载的路径 docker inspect 容器ID 查看详情信息
root@VM-0-8-ubuntu:~# docker inspect test01
        "Mounts": [
            {
                "Type": "volume",
                "Name": "8ebdd5d7274fbd7291178ccd17d3b70420ab333c6ca7241aa497bb64f197e537",
                "Source": "/var/lib/docker/volumes/8ebdd5d7274fbd7291178ccd17d3b70420ab333c6ca7241aa497bb64f197e537/_data",
                "Destination": "volume1",
                "Driver": "local",
                "Mode": "",
                "RW": true,
                "Propagation": ""
            },
            {
                "Type": "volume",
                "Name": "c31d5010b24d1fbbf94a2d93f54c7336aac12a17f96a8980c4ee8a737480fbab",
                "Source": "/var/lib/docker/volumes/c31d5010b24d1fbbf94a2d93f54c7336aac12a17f96a8980c4ee8a737480fbab/_data",
                "Destination": "volume2",
                "Driver": "local",
                "Mode": "",
                "RW": true,
                "Propagation": ""
            }
        ],

```

### **数据卷容器**

容器之间的目录同步  `--volumes-from 容器名称或ID`

```shell
# 启动容器1
ubuntu@VM-0-8-ubuntu:~# docker run -it --name docker01 7ee8ea118b21 /bin/bash

# 启动容器2
# 通过 --volumes-from docker01 参数继承 容器1的数据卷
ubuntu@VM-0-8-ubuntu:/$ docker run -it --name docker02 --volumes-from docker01 7ee8ea118b21 /bin/bash

# 启动容器3
# 通过 --volumes-from docker02 参数继承 容器2的数据卷
ubuntu@VM-0-8-ubuntu:/$ docker run -it --name docker03 --volumes-from docker02 7ee8ea118b21 /bin/bash
```

这三个容器之间的数据卷目录是同步的，只要其中一个容器的数据卷目录内容修改，其他两个容器的数据卷目录也会同步修改。且这种同步是**拷贝式**的同步，也就说这三个容器只要还有一个容器在，其中的数据就会存在，只有三个容器都删除了，数据才会被删除。当前这些数据可以同步到本地，就会持久化到本地了，容器不在数据也都还在。

## Dockerfile

dockerfile是用来构建docker镜像的文件，命令参数脚本。

构建步骤：

1、编写一个dockerfile

2、docker build 构建一个镜像

3、docker run 运行镜像

4、docker push 发布镜像（DockerHub/其他镜像仓库）

### **前提**

1、每个保留关键字（指令）都必须是大写字母

2、执行从上到下顺序执行

3、# 表示注释

4、每个指令都会创建提交一个新的镜像层，并提交。

> 镜像层：每个镜像都是有一层层(layer)组成的。

### **指令**

```shell
FROM 			# 基础镜像，一切从这里开始
MAINTAINER		# 镜像是谁写的，姓名+邮箱
RUN				# 镜像构建的时候需要运行的命令
ADD				# 添加内容到镜像里面，如代码包，环境组件压缩包等内容
WORKDIR			# 镜像的工作目录，进入容器时默认路径
VOLUME			# 挂载的目录，可以指定目录，具名或匿名挂载
EXPOSE			# 暴露端口配置 和运行时 -p 参数一样
CMD				# 指定这个容器启动时运行的命令，追加命令时只有最后一个会生效，这个命令是在容器里运行的
ENTRYPOINT		# 指定这个容器启动时运行的命令，可以追加命令
COPY			# 类似ADD，将我们文件拷贝到镜像中
ENV				# 构建的时候设置环境变量
ONBUILD			# 当构建一个被继承Dockerfile， 这个时候就会运行ONBUILD的指令，触发指令
```

### **构建镜像**

编写一个centos编辑，添加 vim 和net-tools

```shell
# dockerfile1文件
FROM centos
MAINTAINER davis<123456789@qq.com>

ENV MYPATH /usr/local
WORKDIR $MYPATH

RUN yum -y install vim
RUN yum -y install net-tools

EXPOSE 80

#下面三个CMD，运行时，只有最后一个生效
CMD echo $MYPATH
CMD echo "--------end---------"
#当run时追加命令后，还是会覆盖下面的CMD的
CMD /bin/bash

# 通过这个dockerfile文件构建镜像
# docker build -f dockerfile文件路径， -t 镜像名:[tag]
# 这里不写 -f 默认是当前目录的Dockerfile文件
ubuntu@VM-0-8-ubuntu:~/dockerfile# docker build -f dockerfile1 -t mycentos:1.0 .
...
Successfully built b32a84c2312f
Successfully tagged mycentos:1.0

# 进入容器
ubuntu@VM-0-8-ubuntu:~/dockerfile# docker run -it b32a84c2312f
# WORKDIR /usr/local 生效，默认工作目录
[ubuntu@f958e7e0d07e local]# pwd
/usr/local
```

### 错误修改

这里碰到一个问题，就是主机系统是`ubuntu` 而写dockerfile时，写了`RUN apt-get install -y vim`运行构建时报错：`/bin/sh: apt-get: command not found`，最后排查发现，这个镜像基础是`centos` ，要改成`RUN yum -y install vim` 就没问题了。

### **查看镜像构建历史**

```shell
# docker history 镜像名称:[tag]或镜像ID 
ubuntu@VM-0-8-ubuntu:~$ docker history mycentos:1.0 
IMAGE          CREATED          CREATED BY                                      SIZE      COMMENT
b32a84c2312f   22 minutes ago   /bin/sh -c #(nop)  CMD ["/bin/sh" "-c" "/bin…   0B        
487e51e8f067   22 minutes ago   /bin/sh -c #(nop)  CMD ["/bin/sh" "-c" "echo…   0B        
5dce69695403   22 minutes ago   /bin/sh -c #(nop)  CMD ["/bin/sh" "-c" "echo…   0B        
e48a35f8cba3   22 minutes ago   /bin/sh -c #(nop)  EXPOSE 80                    0B        
cef2be9fee89   22 minutes ago   /bin/sh -c yum -y install net-tools             23.3MB    
63fc72f13b81   22 minutes ago   /bin/sh -c yum -y install vim                   58MB      
170b29ea270f   33 minutes ago   /bin/sh -c #(nop) WORKDIR /usr/local            0B        
aeeda5f6c722   33 minutes ago   /bin/sh -c #(nop)  ENV MYPATH=/usr/local        0B        
1e23f9b6394d   33 minutes ago   /bin/sh -c #(nop)  MAINTAINER davis<12345678…   0B        
300e315adb2f   4 months ago     /bin/sh -c #(nop)  CMD ["/bin/bash"]            0B        
<missing>      4 months ago     /bin/sh -c #(nop)  LABEL org.label-schema.sc…   0B        
<missing>      4 months ago     /bin/sh -c #(nop) ADD file:bd7a2aed6ede423b7…   209MB
```

### CMD和ENTRYPOINT的区别

#### CMD

是启用容器时，在容器里执行的命令，只能有一个，也就是说最后一个生效，**不能追加命令**

```shell
# cmd-dockerfile 测试
FROM centos

CMD ["ls", "-l"]
CMD pwd #这个生效

# 默认执行 pwd命令，当前目录是 /
ubuntu@VM-0-8-ubuntu:~/dockerfile# docker run 3e8e866d964d 
/

#当前添加 /bin/echo "exe cmd", 把 pwd命令覆盖了
ubuntu@VM-0-8-ubuntu:~/dockerfile# docker run 3e8e866d964d /bin/echo "exe cmd"
exe cmd

```

#### ENTRYPOINT

是启用容器时，在容器里执行的命令，只能有一个，也就是说最后一个生效，**这个可以追加命令**

```shell
# entrypoint-dockerfile 测试
FROM centos

ENTRYPOINT ["ls", "-l"]
ENTRYPOINT ls #这个生效

# 默认执行 pwd命令，当前目录是 /
ubuntu@VM-0-8-ubuntu:~/dockerfile# docker run a1f5fb1398e2 
bin
dev
etc
home
...

#当前添加 /bin/echo "exe cmd", 把 pwd命令覆盖了
ubuntu@VM-0-8-ubuntu:~/dockerfile# docker run a1f5fb1398e2 -al
total 56
drwxr-xr-x   1 root root 4096 Apr 18 03:53 .
drwxr-xr-x   1 root root 4096 Apr 18 03:53 ..
-rwxr-xr-x   1 root root    0 Apr 18 03:53 .dockerenv
lrwxrwxrwx   1 root root    7 Nov  3 15:22 bin -> usr/bin
drwxr-xr-x   5 root root  340 Apr 18 03:53 dev
...
```

**注意：** 

`ENTRYPOINT ["ls", "-l"]` 和`ENTRYPOINT ls` 这两种写法是有区别的。前者的可以追加命令；后者不可以追加命令，追加命令参数错误也不会报错。

#### 区别

都是在启用容器时运行的命令。

对于`CMD` 来说，追加命令时会覆盖`CMD` 的命令。

```shell
CMD ["pwd"]
# 下面会覆盖 pwd的命令
docker run id /bin/bash
```

对于`ENTRYPOINT`，追加的命令会当作参数追加到`ENTRYPOINT` 的命令里。 

```shell
ENTRYPOINT ["ls", "-l"]
# 下面的a 会追加到 ls -la 里
docker run id a
```

#### 混写

根据区别可以这样写，执行时给一个默认参数，运行时可以覆盖这个参数，也可以不写。

```shell
#需要执行的命令
ENTRYPOINT ["ls"]
#默认参数
CMD ["-a"]
# 覆盖 -a 变成 ls -l
docker run id -l

```

## Docker网络

清空所有镜像和容器后看下安装了`docker` 主机上的网络情况

```shell
ubuntu@VM-0-8-ubuntu:~/dockerfile# ip addr
# 回环地址
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
# 云主机上的内网地址
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:3b:7e:49 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.8/20 brd 172.17.15.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::5054:ff:fe3b:7e49/64 scope link 
       valid_lft forever preferred_lft forever
# docker 生成的地址
3: docker0: <NO-CARRIER,BROADCAST,MULTICAST,UP> mtu 1500 qdisc noqueue state DOWN group default 
    link/ether 02:42:d6:85:30:0d brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.1/16 brd 172.18.255.255 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::42:d6ff:fe85:300d/64 scope link 
       valid_lft forever preferred_lft forever
```

看下运行一个容器后，主机的网络情况和这个容器内的网络情况

```shell
#运行一个容器
docker run -d -P --name tomcat01 tomcat
# 查看主机的网络情况
ubuntu@VM-0-8-ubuntu:~/dockerfile# ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP group default qlen 1000
    link/ether 52:54:00:3b:7e:49 brd ff:ff:ff:ff:ff:ff
    inet 172.17.0.8/20 brd 172.17.15.255 scope global eth0
       valid_lft forever preferred_lft forever
    inet6 fe80::5054:ff:fe3b:7e49/64 scope link 
       valid_lft forever preferred_lft forever
3: docker0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:d6:85:30:0d brd ff:ff:ff:ff:ff:ff
    inet 172.18.0.1/16 brd 172.18.255.255 scope global docker0
       valid_lft forever preferred_lft forever
    inet6 fe80::42:d6ff:fe85:300d/64 scope link 
       valid_lft forever preferred_lft forever
# 多了一个网卡，和容器内的网络对应
103: veth1e07563@if102: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue master docker0 state UP group default 
    link/ether ee:a5:02:bb:ca:7d brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet6 fe80::eca5:2ff:febb:ca7d/64 scope link 
       valid_lft forever preferred_lft forever


#查看容器内的网络情况
ubuntu@VM-0-8-ubuntu:~/dockerfile# docker exec -it tomcat01 ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
# 容器内的网络和主机上有一个网络是对应的
102: eth0@if103: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:ac:12:00:02 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.18.0.2/16 brd 172.18.255.255 scope global eth0
       valid_lft forever preferred_lft forever

# 主机ping 下容器内的网络，可以ping通
ubuntu@VM-0-8-ubuntu:~/dockerfile# ping 172.18.0.2
PING 172.18.0.2 (172.18.0.2) 56(84) bytes of data.
64 bytes from 172.18.0.2: icmp_seq=1 ttl=64 time=0.059 ms
64 bytes from 172.18.0.2: icmp_seq=2 ttl=64 time=0.034 ms
64 bytes from 172.18.0.2: icmp_seq=3 ttl=64 time=0.037 ms
--- 172.18.0.2 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 2024ms
rtt min/avg/max/mdev = 0.034/0.043/0.059/0.012 ms

```

再起一个容器看下，两个容器间的网络是否可以`ping` 通

```shell
# 起一个容器
ubuntu@VM-0-8-ubuntu:~/dockerfile# docker run -d -P --name tomcat02 tomcat
ca159eb9ae38e9c0b676760d567c6cc3f9220112c430f40a1b1efec874bd26f9

#查看 tomcat02的网络
ubuntu@VM-0-8-ubuntu:~/dockerfile# docker exec -it tomcat02 ip addr
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
104: eth0@if105: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:ac:12:00:03 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.18.0.3/16 brd 172.18.255.255 scope global eth0
       valid_lft forever preferred_lft forever

# 在tomcat01内部ping tomcat02容器，是可以ping通的
ubuntu@VM-0-8-ubuntu:~/dockerfile# docker exec -it tomcat01 ping 172.18.0.3
PING 172.18.0.3 (172.18.0.3) 56(84) bytes of data.
64 bytes from 172.18.0.3: icmp_seq=1 ttl=64 time=0.080 ms
64 bytes from 172.18.0.3: icmp_seq=2 ttl=64 time=0.057 ms
64 bytes from 172.18.0.3: icmp_seq=3 ttl=64 time=0.050 ms
^C
--- 172.18.0.3 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 55ms
rtt min/avg/max/mdev = 0.050/0.062/0.080/0.014 ms
```

### 原理

我们每启动一个docker容器，docker就会给docker容器分配 一个IP，我们只要安装了docker，就会有一个docker0的网卡。每个容器和主机通信是通过veth-pair技术。容器间是通过docker0网络作网桥来进行通信的。

每个容器的网卡都是一对对的。

通过`veth-pair` 就是一对虚拟设备接口，它们都是成对出现的，一端连着协议栈，一端彼此连着。

`tomcat01 -> veth-pair -> docker0 -> veth-pair -> tomcat02`

只要删除容器，对应的网卡也会删除的。



### link

> 现有一个场景，编写了一个微服务， `database url=ip`，项目不重启，数据库`IP` 换掉了，我们希望可以处理这个问题，可以通过名字来进行访问容器。

```shell
# 再启动一个容器tomcat03
# 通过 link 连接到tomcat02
docker run -d -P --name tomcat03 --link tomcat02 tomcat

# 通过名称 tomcat02 来ping，可以ping通
root@VM-0-8-ubuntu:~/dockerfile# docker exec -it tomcat03 ping tomcat02
PING tomcat02 (172.18.0.3) 56(84) bytes of data.
64 bytes from tomcat02 (172.18.0.3): icmp_seq=1 ttl=64 time=0.045 ms
64 bytes from tomcat02 (172.18.0.3): icmp_seq=2 ttl=64 time=0.051 ms

--- tomcat02 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 31ms
rtt min/avg/max/mdev = 0.045/0.048/0.051/0.003 ms

#反过来看下 tomcat02 ping 下tomcat03，没有Ping通
root@VM-0-8-ubuntu:~/dockerfile# docker exec -it tomcat02 ping tomcat03
ping: tomcat03: Name or service not known
```

运行容器通过 `--link` 连接到另一个容器时，是怎么可以`ping` 的呢，但是反过来就不行呢？

```shell
#tomcat02的 hosts配置
root@VM-0-8-ubuntu:~/dockerfile# docker exec -it tomcat02 cat /etc/hosts
127.0.0.1	localhost
::1	localhost ip6-localhost ip6-loopback
fe00::0	ip6-localnet
ff00::0	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters
172.18.0.3	ca159eb9ae38

#tomcat03的 hosts配置
root@VM-0-8-ubuntu:~/dockerfile# docker exec -it tomcat03 cat /etc/hosts
127.0.0.1	localhost
::1	localhost ip6-localhost ip6-loopback
fe00::0	ip6-localnet
ff00::0	ip6-mcastprefix
ff02::1	ip6-allnodes
ff02::2	ip6-allrouters
172.18.0.3	tomcat02 ca159eb9ae38  # tomcat02
172.18.0.4	62b2d87252ac
```

`--link` 是通过配置`hosts` 映射去的。这个配置是单向的，如果两个都想通过名称 `ping` 可以再配置这个映射关系。现在不建议使用这个。

### 自定义网络

> 查看docker所有网络

```shell
root@VM-0-8-ubuntu:~/dockerfile# docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
6e1de43b74c2   bridge    bridge    local
db3980b1fcf5   host      host      local
18ef73263cc8   none      null      local
```

**网络模式**

bridge：桥接模式 docker默认

none： 不配置网络

host：和宿主机共享网络

container：容器网络连通（用的少，局限很大）

```shell
# 默认的网络 --net bridge 
docker run -d -P --name tomcat01 tomcat
docker run -d -P --name tomcat01 --net bridge tomcat

# 自定义网络
# --driver bridge 模式
# --subnet 192.168.0.0/16 子网范围
# --gateway 192.168.0.1 网关
docker network create --driver bridge --subnet 192.168.0.0/16 --gateway 192.168.0.1 mynet

# 查看网络
root@VM-0-8-ubuntu:~/dockerfile# docker network ls
NETWORK ID     NAME      DRIVER    SCOPE
6e1de43b74c2   bridge    bridge    local
db3980b1fcf5   host      host      local
81c9124b9e61   mynet     bridge    local  # 自己创建的网络
18ef73263cc8   none      null      local

#创建两个容器，测试下网络
root@VM-0-8-ubuntu:~/dockerfile# docker run -d -P --name tomcat-net1 --net mynet tomcat
2a2cd72c70c48826fce4df70266aa0f7a6ac539929887d48c5b6afb88519f087
root@VM-0-8-ubuntu:~/dockerfile# docker run -d -P --name tomcat-net2 --net mynet tomcat
4142473bb11ed5cb6e83ba54e082424919c12dbe876a31968f34a75693c04545

#直接通过名称可以ping tomcat-net2通过，不需要--link
root@VM-0-8-ubuntu:~/dockerfile# docker exec -it tomcat-net1 ping tomcat-net2
PING tomcat-net2 (192.168.0.3) 56(84) bytes of data.
64 bytes from tomcat-net2.mynet (192.168.0.3): icmp_seq=1 ttl=64 time=0.064 ms
64 bytes from tomcat-net2.mynet (192.168.0.3): icmp_seq=2 ttl=64 time=0.075 ms
--- tomcat-net2 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 25ms
rtt min/avg/max/mdev = 0.064/0.069/0.075/0.010 ms

#直接通过名称可以ping tomcat-net1通过，不需要--link
root@VM-0-8-ubuntu:~/dockerfile# docker exec -it tomcat-net2 ping tomcat-net1
PING tomcat-net1 (192.168.0.2) 56(84) bytes of data.
64 bytes from tomcat-net1.mynet (192.168.0.2): icmp_seq=1 ttl=64 time=0.108 ms
64 bytes from tomcat-net1.mynet (192.168.0.2): icmp_seq=2 ttl=64 time=0.057 ms
--- tomcat-net1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss, time 39ms
rtt min/avg/max/mdev = 0.057/0.074/0.108/0.024 ms
```

我们自定义的网络docker都已经帮我们维护好了对应的关系，而docker0，则需要自己维护。

### 网络连通

在docker0的网络里，有一个容器tomcat01，这个容器怎么连接到mynet的网络呢？

```shell
# 测试下，并不能ping 通
root@VM-0-8-ubuntu:~/dockerfile# docker exec -it tomcat01 ping tomcat-net1
ping: tomcat-net1: Name or service not known

#查看 connet命令
root@VM-0-8-ubuntu:~/dockerfile# docker network connect --help

Usage:  docker network connect [OPTIONS] NETWORK CONTAINER
```

试下这个命令

```shell
# 把 tomcat01 连接到 mynet网络
docker network connect mynet tomcat01

# 测试下，能ping 通了
root@VM-0-8-ubuntu:~/dockerfile# docker exec -it tomcat01 ping tomcat-net1
PING tomcat-net1 (192.168.0.2) 56(84) bytes of data.
64 bytes from tomcat-net1.mynet (192.168.0.2): icmp_seq=1 ttl=64 time=0.070 ms
64 bytes from tomcat-net1.mynet (192.168.0.2): icmp_seq=2 ttl=64 time=0.061 ms
--- tomcat-net1 ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 10ms
rtt min/avg/max/mdev = 0.061/0.065/0.070/0.009 ms

# 看下tomcat02 ，也不能通
root@VM-0-8-ubuntu:~/dockerfile# docker exec -it tomcat02 ping tomcat-net1
ping: tomcat-net1: Name or service not known

# 查看 mynet 的网络情况，发现tomcat01,直接加到mynet网络里了。
root@VM-0-8-ubuntu:~/dockerfile# docker network inspect mynet
[
    {
        "Name": "mynet",
        "Id": "81c9124b9e6129413eb2d04a9b9b29cdac3e8b4d19f6dac819e305be94c02eb2",
        "Created": "2021-04-18T16:07:06.27961121+08:00",
        "Scope": "local",
        "Driver": "bridge",
        "EnableIPv6": false,
        "IPAM": {
            "Driver": "default",
            "Options": {},
            "Config": [
                {
                    "Subnet": "192.168.0.0/16",
                    "Gateway": "192.168.0.1"
                }
            ]
        },
        "Internal": false,
        "Attachable": false,
        "Ingress": false,
        "ConfigFrom": {
            "Network": ""
        },
        "ConfigOnly": false,
        "Containers": {
            "2a2cd72c70c48826fce4df70266aa0f7a6ac539929887d48c5b6afb88519f087": {
                "Name": "tomcat-net1",
                "EndpointID": "5412d8e87dc1ab95961d1c3acc0d31027f570ada6eb78b04fcff289532833b24",
                "MacAddress": "02:42:c0:a8:00:02",
                "IPv4Address": "192.168.0.2/16",
                "IPv6Address": ""
            },
            "4142473bb11ed5cb6e83ba54e082424919c12dbe876a31968f34a75693c04545": {
                "Name": "tomcat-net2",
                "EndpointID": "0f2981d39fc3c38d74510c2ad84c1191ae0f3fe138446257b4183ed0b0b4216a",
                "MacAddress": "02:42:c0:a8:00:03",
                "IPv4Address": "192.168.0.3/16",
                "IPv6Address": ""
            },
            "67939d5a53c58dad2ce03873159fd0b96a73992049f2f348a6a22755589901bc": {
                "Name": "tomcat01",
                "EndpointID": "e885178213617bfc9c56cc40d25c1a6e50a5c96d6f71025927c51347613d587e",
                "MacAddress": "02:42:c0:a8:00:04",
                "IPv4Address": "192.168.0.4/16",
                "IPv6Address": ""
            }
        },
        "Options": {},
        "Labels": {}
    }
]

```

tomcat01加到mynet里后，这个容器就有两个IP了，就像云主机一样，一个内网IP，一个公网IP。

这个容器可以在两个网络里通信了。