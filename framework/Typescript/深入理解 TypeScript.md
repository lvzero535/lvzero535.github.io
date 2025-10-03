# 深入理解 TypeScript

地址：https://jkchao.github.io/typescript-book-chinese/

## 声明空间

### 类型声明空间

类型声明可以用作类型注解。类型声明不能作为值使用。（除了class声明的）

```typescript
class Foo {}
interface Bar {}
type Bas = {}

let a: Foo;
let b: Bar;
let c: Bas;

let d = Bar;
let e = Bar; // “Bar”仅表示类型，但在此处却作为值使用。
let f = Bas; // “Bas”仅表示类型，但在此处却作为值使用。
```

### 变量声明空间

变量声明和JS一样，正常声明变量使用。但是变量不能作为类型注解使用。除了`class`。

```typescript
const Foo = 'ad';
let foo: Foo; // “Foo”表示值，但在此处用作类型。是否指“类型 Foo”?
```

**注意**
`class`比较特别，声明`class`时，不仅声明了一个变量，还声明了一个类型。

## 模块

### 全局模块

默认情况下，在一个新文件下写代码时，它是处理全局命名空间中的，如果其中一个文件声明了一个变量，在其他文件再声明全报错。

```typescript
// index.ts
const foo = 'foo';

// src/util.ts
// const foo = 'foo' // 无法重新声明块范围变量“foo”。 
const bar = foo // 正常
```

### 文件模块

文件模块也称为外部模块，如果TS文件的根级别位置含有`import`或`export`，会在当前文件创建一个本地作用域。如果想使用文件模块的变量，必须`export`导出，且在使用的地方`import`，所有使用了`export`和`import`关键字的文件都属于文件模块，里面声明的变量不会污染全局变量

```typescript
// index.ts
export const foo = 'foo';

// src/util.ts
const foo = 'foo' // 正常声明，不会报错 
```

```typescript
// index.ts
export const foo = 'foo';

// src/util.ts
const bar = foo // 如果不import，会报错：找不到名称“foo”。你是否指的是“foos”?
```

## 模块路径

模块路径分为两种：`相对模块路径` 和 `其他动态查找模块`

### 相对模块路径

相对模块路径就是导入模块的路径是以`.`开头的，和所有文件的导入一样的。

```typescript
import { foo } from './foo.ts'
import { foo } from '../foo.ts'
import { foo } from '../some/foo.ts'
```

### 动态查找

如果导入模块不是相对路径，模块解析将会模仿`Node模块解析策略`。比如以下两个例子：

1. `import { foo } from 'foo'`，将会按以下顺序查找模块

- `./node_modules/foo`
- `../node_modules/foo`
- `../../node_modules/foo`
- 直到系统的根目录

2. `import { foo } from 'some/foo'`，将会按以下顺序查找模块

- `./node_modules/some/foo`
- `../node_modules/some/foo`
- `../../node_modules/some/foo`
- 直到系统的根目录

以上例子中，虽然`foo`模块找到了，但是`foo`也可能是文件夹，所以还有内容检查

- 如果`foo`表示一个文件，如`foo.ts`，返回。
- 否则，如果`foo`表示一个文件夹，且存在一个文件`foo/index.ts`，返回。
- 否则，如果`foo`表示一个文件夹，且存在一个文件`foo/package.json`，在该文件中指定types的文件存在，返回。
- 否则，如果`foo`表示一个文件夹，且存在一个文件`foo/package.json`，在该文件中指定main的文件存在，返回。
从文件类型上来说，实际指的是`.ts, .d.ts, .js`

## 类型兼容性

- 类

只有实例成员和方法比较，构造函数和静态成员不会检查

## 编译上下文

```json
{
  "compilerOptions": {

    /* 基本选项 */
    "target": "es5",                       // 指定 ECMAScript 目标版本: 'ES3' (default), 'ES5', 'ES6'/'ES2015', 'ES2016', 'ES2017', or 'ESNEXT'
    "module": "commonjs",                  // 指定使用模块: 'commonjs', 'amd', 'system', 'umd' or 'es2015'
    // 
    "lib": [],                             // 指定要包含在编译中的库文件
    "allowJs": true,                       // 允许编译 javascript 文件
    "checkJs": true,                       // 报告 javascript 文件中的错误
    "jsx": "preserve",                     // 指定 jsx 代码的生成: 'preserve', 'react-native', or 'react'
    "declaration": true,                   // 生成相应的 '.d.ts' 文件
    "sourceMap": true,                     // 生成相应的 '.map' 文件
    "outFile": "./",                       // 将输出文件合并为一个文件
    "outDir": "./",                        // 指定输出目录
    "rootDir": "./",                       // 用来控制输出目录结构 --outDir.
    "removeComments": true,                // 删除编译后的所有的注释
    "noEmit": true,                        // 不生成输出文件
    "importHelpers": true,                 // 从 tslib 导入辅助工具函数
    "isolatedModules": true,               // 将每个文件作为单独的模块 （与 'ts.transpileModule' 类似）.

    /* 严格的类型检查选项 */
    "strict": true,                        // 启用所有严格类型检查选项
    "noImplicitAny": true,                 // 在表达式和声明上有隐含的 any类型时报错
    "strictNullChecks": true,              // 启用严格的 null 检查
    "noImplicitThis": true,                // 当 this 表达式值为 any 类型的时候，生成一个错误
    "alwaysStrict": true,                  // 以严格模式检查每个模块，并在每个文件里加入 'use strict'

    /* 额外的检查 */
    "noUnusedLocals": true,                // 有未使用的变量时，抛出错误
    "noUnusedParameters": true,            // 有未使用的参数时，抛出错误
    "noImplicitReturns": true,             // 并不是所有函数里的代码都有返回值时，抛出错误
    "noFallthroughCasesInSwitch": true,    // 报告 switch 语句的 fallthrough 错误。（即，不允许 switch 的 case 语句贯穿）

    /* 模块解析选项 */
    "moduleResolution": "node",            // 选择模块解析策略： 'node' (Node.js) or 'classic' (TypeScript pre-1.6)
    "baseUrl": "./",                       // 用于解析非相对模块名称的基目录
    "paths": {},                           // 模块名到基于 baseUrl 的路径映射的列表
    "rootDirs": [],                        // 根文件夹列表，其组合内容表示项目运行时的结构内容
    /**
        默认所有 @types下的子目录都会包含进在编译的上下文中，
        也就是说./node_modules/@types，../node_modules/@types，../../node_modules/@types里的类型声明都是可见的。
        如果指定了该值，如['./types', './vendor/types']，则只会包含数组里的目录对应的类型，其他的都会忽略（如@types目录相关的），
     */
    "typeRoots": [],                       // 包含类型声明的文件列表
    /**
    默认所有@types下的目录都会包含在全局作用域里，和typeRoots一样。
    如果指定，如['node', 'jest']，则只有 node和jest目录（模块）的类型在全局作用域，其他的会忽略，如安装了jquery，也会被忽略。
    types和typeRoots的区别是，前者影响的是模块，已安装的模块；后者是目录。
     */
    "types": [],                           // 需要包含的类型声明文件名列表
    "allowSyntheticDefaultImports": true,  // 允许从没有设置默认导出的模块中默认导入。

    /* Source Map Options */
    "sourceRoot": "./",                    // 指定调试器应该找到 TypeScript 文件而不是源文件的位置
    "mapRoot": "./",                       // 指定调试器应该找到映射文件而不是生成文件的位置
    "inlineSourceMap": true,               // 生成单个 soucemaps 文件，而不是将 sourcemaps 生成不同的文件
    "inlineSources": true,                 // 将代码与 sourcemaps 生成到一个文件中，要求同时设置了 --inlineSourceMap 或 --sourceMap 属性

    /* 其他选项 */
    "experimentalDecorators": true,        // 启用装饰器
    "emitDecoratorMetadata": true          // 为装饰器提供元数据的支持
  }
}
```
