# 手写JavaScript

## 1. bind函数

```js

Function.prototype.myBind = function (context, ...args) {
  const self = this
  return function (...newArgs) {

    // 处理构造函数调用
    if (new.target) {
      return new self(...args, ...newArgs)
    }

    // 处理普通函数调用
    return self.apply(context, [...args, ...newArgs])
  }
}
```

## 2. call函数  

```js

Function.prototype.myCall = function(context, ...args) {
  // 如果 context 是基础类型，强制转换为对象
  context = context ?? globalThis

  const fnSymbol = Symbol('fn')
  context[fnSymbol] = this

  const result = context[fnSymbol](...args)

  delete context[fnSymbol]
  return result
}

```

## 3. apply函数

```js

Function.prototype.myCall = function(context, args) {
  // 如果 context 是基础类型，强制转换为对象
  context = context ?? globalThis

  const fnSymbol = Symbol('fn')
  context[fnSymbol] = this

  const result = args ? context[fnSymbol](...args) : context[fnSymbol]();

  delete context[fnSymbol]
  return result
}

```

## 4. instanceof操作符

`left instanceof Right` 判断 left是否是Right的实例，实际就是，Right.prototype是否在left的原型链上。

```js

function instanceof(left, right) {

  // 遍历 left 的原型链
  let proto = Object.getPrototypeOf(left)
  while (proto !== null) {
    // 如果原型链上有 right.prototype，返回 true
    if (proto === right.prototype) {
      return true
    }
    // 否则，继续向上遍历原型链
    proto = Object.getPrototypeOf(proto)
  }

  // 如果遍历完原型链都没有找到 right.prototype，返回 false
  return false
}

```

## 5. new实现

new一个构造函数时，主要过程有四个：

1. 创建一个新的对象。
2. 把构造函数的原型赋值给新对象的原型。
3. 判断this并且执行构造函数给this的属性赋值。
4. 返回一个新对象或者是返回构造函数返回的对象。
  
注意：当构造函数返回对象时，this指向失效了。

```js
function newFn(Fn, ...args) {
  const obj = {};
  Object.setPrototypeOf(obj, Fn.prototype);
  const ret = Fn.call(obj, ...args);

  if(ret !== null && (typeof ret === 'object' || typeof ret === 'function')) {
    return ret;
  }
  return obj;
}
```

## 6. 柯理化函数

```js
function curry(fn) {
  return function curried (...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...newArgs) {
      return curried(...args, ...newArgs);
    }
  }
}
```
