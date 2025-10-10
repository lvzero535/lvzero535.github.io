# 深入理解 TypeScript

## 基础类型

- any 
- number
- string
- boolean
- 数组， const a: number[] 或 const b: Array`<number>`
- 元组，元组上元素位置的类型是固定的 const a: [string, number]; a = ['2', 1]; 正确 a = [2, '3']; 报错

## 联合类型

联合类型表示一个值可以是几种类型之一。

- 取值可以为多种类型中的一种 const a: string | number;
- 当类型不确定时，只能是这些类型的公共属性或公共方法
- 赋值进可以进行类型推断
  
```typescript
const a: string | number;
a = 'l'; // string
a.length; // ok
a = 2; // number
a.length; // error
```

## 交叉类型

交叉类型是多个类型合并成一个类型，合成后的类型包含了所有类型的特征，主要用于混入。如`Person & Logger`

```typescript
interface Person {
    name: string;
}
interface Logger {
    log (): void;
}
type newType = Person & Logger;
// 上面等于
interface newType {
    name: string;
    log (): void;
}
```

## 接口

对象使用接口类型时，对象的属性要和接口的`一致`不能多，除了可选属性其他的不能少.
可以给接口定义任意类型的属性，但是确定和可选属性必须是任意属性的子类型，定义时满足即可。

```typescript
interface Person {
    name:string;
    age: number;
    [key: string]: any; // 任意类型，这里不能是string，因为number不是string的子类型
}
```

- 接口可以继承接口，且可以继承多个接口
- 接口也可以继承类，且可以继承多个类，可以和接口混关继承

> 类在声明后，也可以当成类型来使用，这个类型是实例化后对象，即是不包括静态属性和方法还有构造函数，只包含实例的属性和方法

```typescript
class Point {
    static a = 'a';
    static say() {}
    x: number;
    y: number;
    d (): void {};
    constructor() {}
  }
  interface PType {
    x: number;
    y: number;
    d (): void {}; 
  }
```

> 作为类型使用时，类Point和接口PType是等价的，所以接口可以继承类，但实际是继承的是Point类实例的类型

## 函数

- 定义函数有声明和表达，调用时参数和定义的必须一样，除了可选参数。
- 可选参数必须放在最后
- 参数可以带默认值，带有默认值的参数如果后面没有必填参数可以当做可选参数。
- 函数可以重载，定义同一名称不同参数类型。重载时，前面只需要定义函数结构，即是不同的参数重载，最后一个实现即可，在匹配时优先匹配前面的。

```typescript
function reverse(x: number);
function reverse(x: string);
function reverse(x: number | string): number | string | void {
    if (typeof x === 'number') {
        return Number(x.toString().split('').reverse().join(''));
    } else if (typeof x === 'string') {
        return x.split('').reverse().join('');
    }
}
```

## 类

- 只能继承一个类，但可以实现多个接口
- 构造函数使用private时，不能被new也不能继承
- readonly时只能在构造函数中赋值
- 抽象类不能被new只能被继承，子类必须实现基类的抽象方法

## 断言

- 通过as，`值 as 类型；person as Person`
- 通过`<>` `<类型>值; <Person>person | (<any>window)`在tsx中使用会报错
- 去掉`null | undefined` `const a: string | null;`使用`a.toString()`时会报错，这里可能是`null`，这里可以使用断言`"!"`去掉`null | undefined`,使用`!`断言后编译器判断当前值不会是`null | undefined`,`a!.toString()`

## 类型别名

类型别名会给一个类型起个新的名字。有时和接口很像，但可以作用于原始值，联合类型，元组以及其他需要手写的类型。
> 起别名不会新建一个类型，它只是创建了一个新的名字来引用那个类型。类型别名也可以使用泛型。
**注意**：类型别名不能出现在声明右侧的任何地方。

**和接口的区分**

- 接口会创建一个类型，类型别名不会
- 接口可以被接口继承和被类实现，类型不行

## 协变与逆变

协变与逆变主要是为了保护类型的安全性。

### 协变

协变是指在变量赋值时，子类型可以赋值给父类型，这是安全的。
原因是，子类型会包含父类型的所有属性和方法，所以赋值时不会丢失信息。反过来，父类型赋值给子类型时，可能会丢失信息，所以是不安全的。

```typescript
interface Animal {
    name: string;
}
interface Dog extends Animal {
    breed: string;
}
let animal: Animal = { name: 'Triceratops' };
let dog: Dog = { name: 'Chase', breed: 'Pit Bull' };

// 这里dog包含了animal的所有属性，所以赋值时不会丢失信息
animal = dog; // ok
// 这里animal只包含name属性，所以赋值时不会丢失信息
// error Property 'breed' is missing in type 'Animal' but required in type 'Dog'.(2741)
dog = animal; 

```

### 逆变

逆变是指在带有参数的函数赋值时，和变量类型相反，参数是父类型的函数可以赋值给参数是子类型的函数。
原因是：带有子类型参数的函数`sf`赋值给带有父类型参数的函数`pf`后，当调用`pf`时，传入的参数类型要求是父类型，而`sf`的参数类型是子类型，所以会报错。

```typescript
interface Person {
  name: string;
}

interface Student extends Person {
  age: number;
}

type pF = (p: Person) => void;
type sF = (s: Student) => void;

let pf: pF = (p: Person) => {
  console.log(p.name);
};

let sf: sF = (s: Student) => {
  console.log(s.name);
  console.log(s.age);
};

// error
//Type 'sF' is not assignable to type 'pF'.
//  Types of parameters 's' and 'p' are incompatible.
//    Property 'age' is missing in type 'Person' but required in type 'Student'.(2322)
pf = sf;

// ok
sf = pf;

```

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

## 实践操作

### 把数组的值作为联合类型

```typescript
const arr = ['a', 'b', 'c'] as const // arr为只读， const断言时，只能是字面量
type abc = typeof arr[number] // 'a' | 'b' | 'c'
```

### 全局声明一个函数

```typescript
declare global {
    function id<T>(val: T): T;
}
```

## TS操作符

### ??

空值合并运算符（??）是一个逻辑运算符。当左侧操作数为 null 或 undefined 时，其返回右侧的操作数。否则返回左侧的操作数。

与逻辑或（||）操作符不同，逻辑或会在左操作数为 falsy 值时返回右侧操作数。也就是说，如果你使用 || 来为某些变量设置默认的值时，你可能会遇到意料之外的行为。比如为 falsy 值（’’、NaN 或 0）时。

```typescript
const foo = null ?? 'default string';
console.log(foo); // 输出："default string"
const baz = 0 ?? 42;
console.log(baz); // 输出：0

```

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

### 扩展模块（包）接口

给第3方包扩展接口时，需要在`declare module '包名'`里扩展。
如扩展vue3的全局属性`$http`和`$i`
> vue3不再使用Vue.prototype扩展全局属性，而是使用app.config.globalProperties扩展。

```typescript

import axios from 'axios';
declare module 'vue' {
    interface ComponentCustomProperties {
        $http: typeof axios; // 扩展$http, 可以在组件里使用使用this.$http
        $i: (key: string) => string; // 扩展$i, 可以在组件里使用使用this.$i
      }
}
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
