# Gitlab

## 镜像安装

1. docker pull gitlab/gitlab-ce
2. [安装文档](https://docs.gitlab.com/ee/install/docker.html)

`export GITLAB_HOME=/srv/gitlab`

```shell
sudo docker run --detach \
  --hostname gitlab.example.com \
  --publish 443:443 --publish 80:80 --publish 2222:22 \
  --name gitlab \
  --restart always \
  --volume $GITLAB_HOME/config:/etc/gitlab \
  --volume $GITLAB_HOME/logs:/var/log/gitlab \
  --volume $GITLAB_HOME/data:/var/opt/gitlab \
  --shm-size 256m \
  gitlab/gitlab-ce:latest
```

22 端口冲突问题，把 22 端口改成 2222
配置修改
vim /srv/gitlab/config/gitlab.rb

- 22 端口冲突问题，把 22 端口改成 2222

  - gitlab_rails['gitlab_shell_ssh_port'] = 2222
  - gitlab_rails['gitlab_ssh_host'] = '81.81.81.81'

- 首次登录初始密码 /srv/gitlab/config/initial_root_password
- 配置 external_url 'http://81.81.81.81' 通过 `http://81.81.81.81` 访问

## 重置 root 密码

1. 进入 gitlab-rails console
2. 查找用户 user = User.find_by_username 'root'
3. 修改密码 user.password = 'secret_pass'
4. 确认密码 user.password_confirmation = 'secret_pass'
5. 保存密码 user.save!
6. 退出 exit

## 配置 pages

1. Pages 服务地址
   pages_external_url "http://81.81.81.81"

2. 启用 pages
   gitlab_pages['enable'] = true

3. 必须指定一个 job 是 pages
   1. pages 的 job 下必须要有 artifacts
   2. paths 指定 pages 的入口 入口必须是 public

```yaml
artifacts:
  paths:
    - public
```

## gitlab runner

[安装文档](https://docs.gitlab.com/runner/install/docker.html)

- 镜像下载
  docker pull gitlab/gitlab-runner

- 运行镜像

```shell
docker run -d --name gitlab-runner --restart always \
     -v /srv/gitlab-runner/config:/etc/gitlab-runner \
     -v /var/run/docker.sock:/var/run/docker.sock \
     gitlab/gitlab-runner:latest
```

1. 注册 gitlab-runner register 需求获取 runner 的 token
2. 所有任务都是运行在 runner 中的
3. 项目要运行 group runner，需要禁止 shared runner

## CI/CD简介

### CI 持续集成（Continuous Integration）

持续集成（Continuous Integration）指的是，频繁地（一天多次）将代码集成到主干。
持续集成的目的，就是让产品可以快速迭代，同时还能保持高质量。
它的核心措施是，代码集成到主干之前，必须通过自动化测试。只要有一个测试用例失败，就不能集成。

### CD 持续交付/部署

- 持续交付 (转测)

持续交付（Continuous delivery）指的是，频繁地将软件的新版本，交付给质量团队或者用户，以供评审。如果评审通过，代码就进入生产阶段。

- 持续部署（发布）

持续部署（continuous deployment）是持续交付的下一步，指的是代码通过评审以后，自动部署到生产环境。

- https://www.jianshu.com/p/61b5b549d215

## CI/CD的价值体现

- 尽早反馈，尽早发现错误。
- 减少集成问题，每次发现问题当时解决，避免问题堆积。
- 每次更改都能成功发布，降低发布风险。
- 更加频繁的交付价值，客户反馈。

## CI/CD工具

- Jenkins

专业的CI工具，可扩展自动化服务器、安装配置简单、丰富的插件库、分布式架构设计、支持所有的平台、可视化的管理页面。

- GitLab

端到端DevOps工具，常用功能：代码审查、问题跟踪、动态订阅、易于扩展、项目wiki、多角色项目管理、项目代码在线编译预览、CI工具集成。

## GitLab CI/CD架构

- GitLab CI/CD

GitLab CI/CD 是一个内置在GitLab中的工具。

- GitLab Runner

是一个处理构建的应用程序。 它可以单独部署，并通过API与GitLab CI/CD一起使用。

- .gitlab-ci.yml

定义流水线作业运行，位于应用项目根目录下。
为了运行测试，至少需要一个`GitLab`实例、一个 `GitLab Runner`、一个`gitlab-ci`文件

## GitLab CI/CD工作原理

- 将代码托管到Git存储库。
- 默认情况，在项目根目录创建ci文件 `.gitlab-ci.yml`，在文件中指定构建，测试和部署脚本。
- 当前代码push时，GitLab的webhook会检测到代码变更，并使用`GitLab Runner`工具运行相应的`script`脚本。
- 脚本被分组为作业，它们共同组成了一个管道。

## GitlabRunner简介

GitLab Runner是一个开源项目，用于运行您的作业并将结果发送回GitLab。它与GitLab CI结合使用，GitLab CI是GitLab随附的用于协调作业的开源持续集成服务。

## GitLabRunner注册

- **GitLabRunner类型**

- group： 运行特定group下的所有项目的作业（group）
- specific: 运行指定的项目作业（project）
- shared ： 运行整个平台项目的作业（gitlab）(在gitlab上运行要禁止)
- locked： 项目无法运行作业（在specific时才有，为true时，其他项目无法使用该runner）
- paused： 项目不会运行作业

https://www.jianshu.com/p/6decaed7b648

https://docs.gitlab.com/runner/executors/docker.html#how-pull-policies-work

- **命令行注册**

`gitlab-runner register`

## .gitlab-ci.yml文件

https://docs.gitlab.com/ee/ci/yaml/#keywords

```yaml

before_script:
  - echo "before-script!!"

variables:
  DOMAIN: example.com
  
stages:
  - build
  - test
  - codescan
  - deploy

build:
  before_script:
    - echo "before-script in job"
  stage: build
  script:
    - echo "mvn clean "
    - echo "mvn install"
    - echo "$DOMAIN"
  after_script:
    - echo "after script in buildjob"

unittest:
  stage: test
  script:
    - echo "run test"

deploy:
  stage: deploy
  script:
    - echo "hello deploy"
    - sleep 2;
  
codescan:
  stage: codescan
  script:
    - echo "codescan"
    - sleep 5;
 
after_script:
  - echo "after-script"
```

### stages（数组）

用于定义一个流水线不同job间的执行阶段（顺序）。同一阶段的job并行执行，不同阶段的job按顺序执行。
.pre & .post 是内置的job，不用定义在stages里，一个是前置job，一个是后置的job。

### before_script（数组）

前置脚本，有全局的，也有任务的。任务里的前端脚本会覆盖全局的。before_script失败，导致整个作业失败，其他作业将不会执行（allow_failure为false）。但不会影响after_script

### after_script（数组）

后置置脚本，有全局的，也有任务的。任务里的前端脚本会覆盖全局的。after_script失败不会影响作业失败。

### variables（对象）

定义全局变量，所有作业都可以使用，也可以定义job级别的，全局定义的变量不可修改，因为每个job都是独立的，在job修改后相当重新定义了一个新的变量，但不影响全局定义的。
也可以外部传入，也有内置的变量。

### job（对象）

作业，也就是任务，一条流水线可以一个或多个作业，作业间可以是串行，也可以并行。
命名具有唯一性，且不能是关键字。
每个作业都是**独立**的。
在前面加点表示注释。
job定义后，有很多属性，但至少有一个script。

### stage

定义当前job的阶段，取值是`stages`数组中的值，不同定义`stages`中没有的，会报错。不同的job可以定义一样的，这样就是并行执行

### script（数组 or 字符串）

写在runner中运行的命令

### allow_failure（true or false）

当为true时允许当前作业失败，即当前作业失败后不影响后面的作业执行，默念是false。如果作业失败，该作业将在用户界面中显示橙色警告

### tags （数组）

指定当前job使用的runner，在注册runner的时候会填有tags，这里填不同runner的tags会卡住，也就是说一个job只能在一个runner上执行，但是不同的Job可以在不同的runner上执行。

### when （枚举）

1. on_success 前面所有作业都成功（标记为allow_failure被视为成功）后时才执行作业，默认值
2. on_failure 前面成功则不执行会跳过去，当前面失败时执行，执行后，如果后面有存在job，那存在的job也都会跳转，且流水标记为失败。
3. always 不管先前作业如何，总是执行。
4. manual 不会自动执行，需要手动操作执行作业。如果后面存有job，那存在的job会继续执行。
5. delayed 延迟一定时间后执行作业（在GitLab 11.14中已添加）。
在`start_in`字段填写时间，没带单位要加引号，取值是：
    '5', 10 seconds,30 minutes, 1 day, 1 week 。

### retry（number | [object: max: | when]）

当job失败时，重试的次数，最多重试2次，也就是说，值只能是 0 | 1 | 2，默认是0。
对象时有，max，when。

1. max 重试次数 0 | 1 | 2
2. when 失败原因重试

- always ：在发生任何故障时重试（默认）.
- unknown_failure ：当失败原因未知时。
- script_failure ：脚本失败时重试。
- api_failure ：API失败重试。
- stuck_or_timeout_failure ：作业卡住或超时时。
- runner_system_failure ：运行系统发生故障。
- missing_dependency_failure: 如果依赖丢失。
- runner_unsupported ：Runner不受支持。
- stale_schedule ：无法执行延迟的作业。
- job_execution_timeout ：脚本超出了为作业设置的最大执行时间。
- archived_failure ：作业已存档且无法运行。
- unmet_prerequisites ：作业未能完成先决条件任务。
- scheduler_failure ：调度程序未能将作业分配给运行scheduler_failure。
- data_integrity_failure ：检测到结构完整性问题。

### timeout

配置Job的超时时间，可以超过项目级别，不能超过runner级别的超时时间。`timeout: 3 hours 30 minutes`

### parallel

配置当前job并行运行的实例数，大于2小于50。创建N个并行运行的同一个JOB实例。它们从jobName 1/N到jobName N/N 依次命名。
需要在`/etc/gitlab-runner/config.toml`配置concurrent属性，让runner同时可以运行多个job。
- matrix （13.3）
提共每个job的实例命名和获取命名变量

和阶段并行没啥不同，一个是不同job的并行，一个是同一个job同时运行多次。

### only & except

1. only定义哪个分支和标签的git项目会触发job
2. except定义哪个分支和标签的git项目不会触发job
建议使用`rules`

### rules

rules按顺序评估单个规则，直到第一个匹配上的规则，按规则要么执行Job要么不执行，如果一个都匹配不上就执行当前job。不能同时和`only & except`使用。

- if 条件判断
- changes 当文件修改时触发，由于手动触发时当前changes一直是true,所以建议加上if判断
- exists 当前仓库包含存在的文件时触发
- allow_failure 允许当前job失败，不影响后续job工作，建议和if使用，通过条件判断是否允许失败（如果只有一个条件要加`- when: always`兜底）
- variables 定义变量会覆盖当前job已存在的变量，建议和if使用，通过条件判断是否允许失败覆盖当前已存在的变量（如果只有一个条件要加`- when: always`兜底）

**注意** workflow:rules，和job的一样，但是控制的是整个流水线

```yaml
workflow:
  rules:
    - when: always
unittest:
  stage: test
  script:
    - echo "run test unittest"
  rules:
    - if: $CI_PIPELINE_SOURCE == "push" # 当前流水由Push且app.js修改时触发当前job
      changes:
        - app.js
```

### cache (对象)

通过paths指定需要缓存的目录，路径是相对于项目目录的，在JOB间可以共享缓存的目录。可以定义全局的，也可以定义job级的，job缓存的会覆盖全局的。
> /home/gitlab-runner/cache

- paths（数组）指定缓存的目录
- key 指定当前缓存的index，不指定为default，job会根据当前key去拉取缓存
  files: 数组，指定文件，最多两个，如果文件改变的话，通过文件生成SHA值，如果文件不变则使用default ？？？
  prefix: 添加前缀
- untracked 指定为true时，缓存当前没有被git跟踪的文件 默认是false
- when 当前job的状态下保存缓存
  - on_success 成功时保存，默认值
  - on_failure 失败时保存
  - always 不管成功失败都保存
- policy 当前缓存的策略
  - pull 只拉取，不上传缓存
  - push 只上传，不拉取
  - pull-push ，即拉取也上传，默认值

### artifacts

配置job成功或失败时指定某些文件和目录成为制品，并发送到Gitlab，可供UI下载。

- paths（数组）指定上传的文件或目录，只指定当前项目（$CI_PROJECT_DIR）的目录，不能超出。
- expose_as （字符）在合并请求时用指定的名称公开制品的链接
  - 每个合并最多公开10job的作业
  - 指定目录时，点击链接为浏览器
  - 如果开启pages，制品为单个文件且是`.html or .htm .txt .json .xml .log`结尾，会自己渲染
- name 指定下载时的名称，默认为artifacts
- when 当前job的状态下上传制品
  - on_success 成功时上传，默认值
  - on_failure 失败时上传
  - always 不管成功失败都上传
- expire_in 制品的有效期，从上传开始，默认是30天。如果是最新的即使已过期也不会被删除，旧的过期了才会被删除
- reports 收集测试报告
- exclude 排除某些文件不打包
- untracked 指定为true时，和paths指定的一起，上传当前没有被git跟踪的文件 默认是false

### dependencies

在某个JOB使用了artifacts，后面阶段的job会自动下载前阶段所有带有artifacts的job的制品。使用dependencies，可以指定依赖某个job，也可以指定为`[]`，都不下载artifacts

### image

指定当前JOB的执行环境容器镜像，要runner的执行是docker的。优先使用Job的，然后是全局定义的，如果都没有使用注册时默认的docker

### services

指定第三方镜像，在image的镜像运行前，先运行services指定的镜像，并Link到image镜像

### environment

发布的环境管理

### inherit

是否选择继承default或variables的值

```yaml
default:
  retry: 2
variables:
  VAR: TEST
job:
  inherit:
    default: false # 不继承default
      - retry
    variables: false  # 不继承variables
```

### needs

可无序执行作业，无需按照阶段顺序运行某些作业，可以让多个阶段同时运行。

### pages

生成静态网站

### extends

合并继承过程的job，同属性的，以当前为准

## include

引入外部文件

### local

引用同一仓库的文件，引入Job的stage要定义在入口yml文件的stages中，同名job会合并，同属性的以当前的为准

### file

引入同一实例项目的文件

```yml
include:
  - project: 'group/projectName'
    ref: 'main', # 分支
    file: 'ymlfileName.yml'
```

### remote

引用远程的文件

### template

引用模板文件，只能引用内部模板

## default

定义全局关于Job的关键字默认值。

- after_script
- artifacts
- before_script
- cache
- image
- retry
- services
- tags
- timeout
