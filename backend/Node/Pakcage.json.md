# Package.json

## type

默认是`commomjs`类型，可以指定为`module`。
当`type`为`commomjs`时
扩展名是`.js | .cjs`，node解析文件做为`CommonJS`，但是扩展名是`.mjs`的，做为`es module`模块解析，不管最近的`package.json`的type是什么值。

当`type`为`module`时
扩展名是`.js | .mjs`，node解析文件做为`es module` ，但是扩展名是`.cjs`的，做为`CommonJS`模块解析，不管最近的`package.json`的type是什么值。

## files

指定发布时包含哪些文件（用于npm publish）

## types

- 指定ts类型声明文件(`.d.ts` ) ，共ts或编辑器提示使用
- 通常用于发布到npm的库或模块中，以便使用者获取类型提示

## module

- 指定`esmodule` 格式的入口文件（通常用于打包工具，如webpack，rollup）
- 比`main` 更现代，适合tree-shaking。

## main

- 指定`commonjs` (require())文件入口
- 前端打包工具（如 Vite/Rollup）优先使用 module 字段来导入更优的 ESM 版本。

## exports

- 明确指定用户通过`import` 或 `require `  时应该使用的具体文件。
- 支持不同的模块系统：ESModule、CommonJS;
- 支持Ts的类型声明；
- 限制只暴露你想暴露的路径，提高安全性和封装性；

```json
"exports": {
    ".": {
      "import": "./dist/index.esm.js",
      "require": "./dist/index.cjs.js",
      "types": "./dist/index.d.ts"
    }
  }
```

`"."` 当前包的顶层根路径。

- 表示通过`import "your-package"`  导入时使用的入口
- 可以为不同导入方式提供不同的文件路径。

| 子字段         | 说明                           | 示例文件           |
| ----------- | ---------------------------- | -------------- |
| `"import"`  | 使用 `import` 语法（ESModule）时的入口 | `index.esm.js` |
| `"require"` | 使用 `require()`（CommonJS）时的入口 | `index.cjs.js` |
| `"types"`   | 类型声明入口（等效于顶层 `types` 字段）     | `index.d.ts`   |

```js
// Node.js - CommonJS
const lib = require('your-package')  // 使用 require -> 加载 index.cjs.js

// Modern JS - ESM
import lib from 'your-package'       // 使用 import -> 加载 index.esm.js

```

**✅ 为什么使用 "exports" 比 main/module/types 更推荐？**

| 特性            | `main/module/types` | `exports` |
| ------------- | ------------------- | --------- |
| 支持多入口         | ❌                   | ✅         |
| 更好封装性         | ❌ 自动暴露所有文件          | ✅ 只暴露定义的  |
| 支持 ESM/CJS 区分 | 一般需配合工具             | ✅ 原生支持    |
| 推荐程度          | 兼容旧项目               | ✅ 现代推荐    |

## dependencies

["dependencies"](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#dependencies)

这是一个对象，key为包名，value为要安装的版本，value的有多种写法，主要归类为以下四种：

- 版本号version，符合semver
- Git url
- Local path
- Tarball url

**值的类型**

- version Must match version exactly
- `>version` Must be greater than version
- `>=version` etc
- `<version`
- `<=version`
- ~version "Approximately equivalent to version" See [semver](https://github.com/npm/node-semver#versions)
- ^version "Compatible with version" See [semver](https://github.com/npm/node-semver#versions)
- 1.2.x 1.2.0, 1.2.1, etc., but not 1.3.0
- http://... See 'URLs as Dependencies' below
- '*' Matches any version
- "" (just an empty string) Same as *
- version1 - version2 Same as >=version1 <=version2.
- range1 || range2 Passes if either range1 or range2 are satisfied.
- git... See 'Git URLs as Dependencies' below
- user/repo See 'GitHub URLs' below
- tag A specific version tagged and published as tag See [npm dist-tag](https://docs.npmjs.com/cli/v8/commands/npm-dist-tag)
- path/path/path See [Local Paths](https://docs.npmjs.com/cli/v8/configuring-npm/package-json#local-paths) below

**Git Url**

- `git+ssh://git@github.com:npm/cli.git#v1.0.27`
- `git+ssh://git@github.com:npm/cli#semver:^5.0`
- `git+https://isaacs@github.com/npm/cli.git`
- `git://github.com/npm/cli.git#v1.0.27`

**Local path**

- `../foo/bar`
- `~/foo/bar`
- `./foo/bar`
- `/foo/bar`

使用本地安装时，不同包管理在依赖前面的前缀是不一样的。

1. 使用npm安装如下

```js
//npm install ./test

"dependencies": {
    "test": "file:test"
  }
  ```

2. 使用pnpm安装本地文件时

```js
//pnpm install ./test

"dependencies": {
    "test": "link:test"
  }
  ```

3. 使用yarn安装本地文件时

```js
// yarn add  ./test
"dependencies": {
  "test": "./test"
}
```

## 注意事项

如果使用了`"exports"`  **包根目录以外的文件将默认无法被去直接导入**（除非你显式指定）

| 字段名                 | 类型     | 说明                                          |
| ------------------- | ------ | ------------------------------------------- |
| **name**            | 字符串    | 包名（必填），不能有空格、建议全小写                          |
| **version**         | 字符串    | 包版本，遵循 [SemVer](https://semver.org/)（语义化版本） |
| **description**     | 字符串    | 简要说明                                        |
| **main**            | 字符串    | 入口文件（用于 `require()`）                        |
| **type**            | 字符串    | `module` 表示使用 ES 模块，默认是 CommonJS            |
| **scripts**         | 对象     | 自定义命令，使用 `npm run xxx` 执行                   |
| **keywords**        | 数组     | 关键词，便于被 npm 搜索引擎索引                          |
| **author**          | 字符串或对象 | 作者信息（可包含名字和邮箱）                              |
| **license**         | 字符串    | 开源协议（如 MIT、ISC）                             |
| **dependencies**    | 对象     | 项目运行依赖                                      |
| **devDependencies** | 对象     | 开发环境依赖（不会发布）                                |
| **repository**      | 对象     | 源码托管地址，npm 页面会显示                            |
| **bugs**            | 对象     | 问题反馈页面                                      |
| **homepage**        | 字符串    | 项目主页                                        |
| **engines**         | 对象     | 指定 Node/npm 的版本范围                           |
| **files**           | 数组     | 指定发布时包含哪些文件（用于 npm publish）                 |

| 字段名                      | 功能                          |
| ------------------------ | --------------------------- |
| **bin**                  | 命令行工具配置                     |
| **peerDependencies**     | 指定项目运行所需的“宿主”依赖版本           |
| **optionalDependencies** | 可选依赖，安装失败不报错                |
| **overrides**            | 自定义子依赖版本（从 npm 8 起支持）       |
| **exports**              | 精细化模块导出路径配置（适用于 module 类型包） |

