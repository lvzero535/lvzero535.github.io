# Husky前端配套

前端代码各自规范化的Git Flow操作神器Husky和其配套

## Husky

在使用Git管理代码的过程中会触发各种`hook`, 如`commit`时会触发`pre-commit, commit-msg`, 在执行操作前会先执行`hook`, 只有`hook`成功才会真正的执行具体操作，如果`hook`执行失败，不会有后续的。在每个Git库的`.git`目录下有个`hooks`目录，存有常用`hook`的样例。这些样例是不会被执行的，如果需要执行样例中的哪个`hook`, 如`commit-msg.sample`, 需要把`.sample`去掉，然后需要 `.git`目录下的`config`文件下配置`[core] hooksPath = hooks`， `hooksPath`的值是一个存在各种`hook`目录。实际上初始化Git仓库时，`.git`目录下的`config`是没有`hooksPath`的，`Husky`就是把`hooksPath`的值改成`.husky`，然后再把种Git的`hook`存放在`.husky`目录下。

### 安装Husky

- 安装依赖

> npm install husky --save-dev

- 安装`Git hooks`

> npx husky install

- 保证在执行`install`时可以有 `git hooks`

> npm set-script prepare "husky install"
> 也可以手动添加 `"prepare": "husky install"` 到`package.json`文件 的`scripts`里

`prepare`是`npm`的一个`hook`，在`npm install`后执行`prepare`

```json
"scripts": {
    "prepare": "husky install"
  },
```

### 使用Husky

在执行`npx husky install` 后，生成了一个`.husky`目录，并在当前`.git`目录下的`config`文件添加了一行`hooksPath = .husky`，看到当前目录`.husky`并没有任何Git的`hook`。

添加一个`hook`
> npx husky add .husky/pre-commit "npm test"

可以看到多一个文件`pre-commit`
当git commit 时会先执行`pre-commit`，如果`pre-commit`不中断会commit成功，反之则commit失败
更多用法参数[手册](https://typicode.github.io/husky/#/)
接入来看下和这神器相关的工具

## Commmitlint

Commmitlint是一个用于规范Git提交代码时的commit信息的工具，如果编写的commit信息不符合规范会提交失败。
其原理是这样子的，把提交的信息分成三部分,`header, body, footer`，其中`header`又分成`<type>(<scope>): <subject>`, 然后把提交的信息对应每部分进行检查，不符合定义规则的信息就会报错。

```bash
<type>(<scope>): <subject>
<BLANK LINE>
<body>
<BLANK LINE>
<footer>
```

### 安装Commmitlint

- 依赖

> npm i "@commitlint/config-conventional" -D
> npm i "@commitlint/cli" -D

- 添加`commit-msg`

这个是对commit提交信息规范的，所以使用`husky` 添加一个`commit-msg`并添加`Commmitlint`命令
> npx husky add .husky/commit-msg 'npx --no-install commitlint --edit "$1"'

### 配置Commmitlint

创建配置文件
> echo "module.exports = {extends: ['@commitlint/config-conventional']}" > commitlint.config.js

这个配置文件其实和其他的检查工具定义差不多的，如`eslint`，这里使用的信息规范是`@commitlint/config-conventional`, 也可以去使用其他的配置或者自定义。

```bash
# 使用@commitlint/config-conventional type和subject是必须的，其他都可选
type只能'build', 'chore', 'ci', 'docs', 'feat', 'fix', 'perf', 'refactor', 'revert', 'style', 'test',

git commit -m "test" # error
git commit -m "feat:" # error
git commit -m "feat: msg" # ok
git commit -m "feat(comps): msg" # ok
```

参考：

- [Examples](https://www.conventionalcommits.org/en/v1.0.0/)
- [Github](https://github.com/conventional-changelog/commitlint)
- [官网](https://commitlint.js.org/)

## lint-staged

Husky配合Git，可以在提交代码前做很多事情，比如提交前强制检查`Eslint`和`Stylelint`，如果报错不给提交，这对规范代码有很强约束力。但如果是老项目且`Eslint`没有修改完全，这时候强制检查`Eslint`去修改，这是不可能的。又或者是只改几行代码，提交要对整个项目检查，这也太浪费了。这时就可以使用`lint-staged`。
这个插件主要是获取git staged里面的文件，然后把这些文件交给定义的命令执行，如果通过则提交成功，反之提交失败。也就是说，只对要提交的文件进行检查，没有修改过的文件不作检查，这个插件就是根据git的命令过滤出来哪些文件被修改了，然后交给配置做处理。

- 安装

> npm i lint-staged -D

- hook配置
这个插件放在`pre-commit`，添加`npx --no-install lint-staged`

```bash
# pre-commit 文件
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

npx --no-install lint-staged

```

- 配置

这个配置在`package.json` 里加一个属性`lint-staged`，也可以单独写一个文件，最终就是一个简单的对象

```javascript
{
  "*.{js,vue}": ["eslint"],
  "*.{css,less,scss}": ["stylelint"]
}
```

对象的属性符合`glob`要匹配的文件, 值可以是数组也可以是字符串，就是要执行的命令

参考：

- [Github](https://github.com/okonet/lint-staged#configuration)

## 最后

对于提交代码需要做哪些规范，每个项目都不太一样，但是对于前端来说，如果使用Git管理代码的话，Husky是少不了的，如果规范做的好，配合很多其他的工具使用可以很大程度上提升项目代码质量。
