# JS原型，继承，new和instanceof的实现

## 原型
`JS`里万物皆对象，而对象是由构造函数创建的。基本数据类型都有与之对应的构造函数。如`number` 对应的是`Number`，当你定义一个变量并存储一种数据类型时（变量没有类型，数据有类型），会有相应的数据类型的方法，这些方法从哪里来？其实就是从原型来的。

```javascript
var a = 1; // 定义一个数字型

// a 是基本数据类型，基本数据类型是没有方法的，方法只有对象才有。哪这里为a为啥可以调用方法呢？
// 其实在 a 调用 toFixed 时，JS引擎会自动封装成对象，也就是通过Number构造函数, 这个构造函数里有
// 个原型 prototype 存储了这个类型的一些方法，调用这些方法后，又把这个对象给销毁
a.toFixed(2) // Number.prototype.toFixed
a.toPrecision(3)  // Number.prototype.toPrecision
```



每个对象在创建时内部都有一个内置属性`[[Prototype]]` 指向原型，在浏览器中可以用`__proto__`来表示（注意这个不是标准属性，有些浏览器不存在此属性），这个原型是指构造函数中的`Function.prototype` ，也就是同一个构造函数创建的实例对象都有同样的原型，原型对象中的方法和属性是所有实例对象所共有的。原型中有一个属性是指向构造函数的`Function.prototype.constructor === Function`

```javascript
function Person(name) {
  	this.name = name;
}
var p = new Person()
var p1 = new Person()
p.__proto__ === Person.prototype // true
p.__proto__ .constructor === Person // true
p.__proto__ === p1.__proto__ // true

```



**原型是可以修改的。**

## 原型链

原型也是对象，对象就有原型，这样每个对象内的原型也有自己的原型，这样下去每个原型就可以形成一个链条，这就是原型链。但这个链的尽头在哪里？`JS`里万物虽然都是对象，但这些对象也是有源头的，所有创建这些对象的构造函数的原型都是指向`Object.prototype` ，而`Object.prototype` 的原型是`null` 也就是说这个`Object` 是最基本的构造函数。

这个原型链有啥用呢？

看个例子：

定义一个对象，对象有个属性和一个方法，正常来说对象里没定义的属性或方法，调用的时候属性会返回`undefined` ，方法会抛出一个错误， 我们调用一个`obj.valueOf()` 试试，它是有值返回的，没有报错，说明这个`obj` 对象里有这个方法，那个这个方法是怎么来的呢？

先来看下对象是怎么创建的。对于`JS` 来说创建对象有两种形式。

- 字面量，也是推荐的一种，这是一种简写方式，其实内部还是通过相应的构造函数`new` 出来的。
- 通过相应构造函数创建一个实例对象。这种比较麻烦，一般不推荐这种方法。

前面说过了，在创建对象过程中，对象有个内部属性指向构造函数的原型，这个过程在后面说，具体就是`obj.__proto__ = Object.prototype` 。这个原型上有些方法。



当`obj.val` 取值时，发现当前对象，没有这个属性，它会找到原型，看下原型有没有这个属性，如有就返回这个属性，没用就继续往原型的原型上找，直到没有原型为止，如果一直找不到这个属性就会返回`undefined` 。方法也是如此。

如`valueOf` 方法，不在`obj`对象上，去原型`obj.__proto__`上找，也就是指向的`Object.prototype`

这个对象上有`valueOf`方法，调用。如果这个对象没有，而这个对象的原型是`null` 没有，就是返回`undefined` 这就是经常的报错 `undefined is not function`。



给对象的属性赋值时，属性存在正常赋值，如果属性不存在，它不会往它的原型链上找。也就是说，当给对象属性赋值时，在当前对象找，找到一 直接赋值，找不到直接就创建一个新的属性了，不会往原型链上找到赋值，这也是可以理解的，整条原型链，如果这样操作，所有创建的属性都往最顶级的原型去，那不是很大很大？

```javascript
// 字面量
var obj = {
  p: 1,
  f() {}
}
obj.valueOf() // Object {}
obj.__proto__ == Object.prototype  // true

// 构造函数
var obj = new Object()
obj.p = 1;
obj.f = function() {}
obj.__proto__ == Object.prototype  // true
```

这个原型链有啥用呢？

当开发面向对象编程的时候，就可以通过原型链来封装和继承一些公共的属性或方法了。

（作用域链，其实就是变量的寻找过程，和这个原型链类似）

## 继承

什么是继承？前面说了，原型是可以修改的，就是在创建对象的时候，把带有公共属性的对象指向创建对象的原型，这样新对象就可以继承原型对象上的方法或属性了，继承就是通过原型链的形式来实现。



继承有好几种方式可以实现，每种方式都各有优缺点，这里就不说了，网上很多，这里附上两个不错的地址。

[地址1](https://www.cnblogs.com/humin/p/4556820.html) [地址2](https://zhuanlan.zhihu.com/p/37735247) 直接来一个相对最好的实现方式

```javascript
// 父类
function Person() {}
// 子类
function Man() {
  Person.call(this); // 关联父实例上的属性方法
}
Man.prototype = Object.create(Person.prototype) // 关联原型上的属性方法
Man.prototype.constructor = Man // 修复constructor指引
```

`ES6`和`ES5`在继承上的区别，上面是`ES5`的，来看下`ES6`的实现方式。`ES6` 上的继承是先有父类的实例，才有子类的实例，而`ES5`则恰好相反，先有子类才有父类。

```javascript
class Parent {}
class Children extends {
  constructor() {
  	super()
  }
}
```



## new实现

`new` 一个构造函数时主要过程有四个：

1. 创建一个新的对象。
2. 把构造函数的原型赋值给新对象的内部属性。
3. 判断`this` 并且执行构造函数给`this` 的属性赋值。
4. 返回一个新对象或者是返回构造函数返回的对象。

注意：当构造函数返回对象时，`this`指向失效了。 看下面代码就知道了。

```javascript
function new(Fn, ...args) {
  const obj = {}; // 第一步
  obj.__proto__ = Fn.prototype; // 第二步
  const ret = Fn.call(obj, ...args);// 第三步
  // 以下是第四步
  if (ret !== null && (typeof ret === 'object' || typeof ret === 'function')) {
  	return ret;
  }
  return obj;
}
```



## instanceof实现

`typeof` 判断的是数据类型，而`instanceof` 是一个操作符。`left instanceof Right` 是判断`Right`构造函数的原型`Right.prototype` 是否存在`left` 的原型链，存在返回`true` ，否则返回 `false` 。

```javascript
function instanceof(left, right) {
  const _right = right.prototype;
  const _left = left.prototype;
  while(_left) {
 	if (_left === _right) {
  		return true;
	} 
    _left = _left.__proto__;
 }
  return false;
}
```



> 原型一直是`JS`的重点，很多时候都记不住，现在把自己了解的记下来，并把原型相关的两个`new,instanceof` 关键字的实现一下，方便一起记忆。
