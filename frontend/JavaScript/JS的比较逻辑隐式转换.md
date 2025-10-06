# JS的比较逻辑隐式转换

## 面试题

如何让下面的判断成立？

```js
if (a == 1 && a==2 && a==3) {
  console.log('hello')
}
```

**解决方法**

```js
// 方法一：使用valueOf方法
let a = {
  i: 1,
  valueOf() {
    return this.i++
  }
}

// 方法二：使用[Symbol.toPrimitive]方法
let a = {
  i: 1,
  [Symbol.toPrimitive]() {
    return this.i++
  }
}
```

## 比较规则，按顺序直到获取到确切结果为止

1. 两端存在`NaN`，结果为false。
2. `undefined` 和 `null` 只有与自身比较，或者相互比较时，才会返回true，和其他原始类型比较时，结果都为false。
3. 两端类型相同，直接比较值。
4. 两端都原始类型，先将它们转换为数字，再比较。
5. 一端是对象，另一端是原始类型，先将对象转换为原始类型，再比较。

## 对象转换为原始类型

**对象转换为原始类型的步骤：**

1. 如果对象拥有`[Symbol.toPrimitive]`方法，调用该方法。
   若该方法返回的是原始类型值，直接返回该值。
   若该方法返回的不是原始类型值，抛出类型错误异常。
2. 调用该对象的`valueOf`方法
   若该方法返回的是原始类型值，直接返回该值。
   若该方法返回的不是原始类型值，再调用对象的`toString`方法。
3. 调用`toString`方法
   若该方法返回的是原始类型值，直接返回该值。
   若该方法返回的不是原始类型值，抛出类型错误异常。

```js
NaN == NaN // false
undefined == undefined // true
null == null // true
null == undefined // true
'hello' == 'hello' // true
0 == false // true
1 == true // true
0 == '' // true
0 == '0' // true
0 == [] // true
'' == false // true
'' == [] // true
'0' == 0 // true
'0' == [] // false
'1' == true // true
'1' == [1] // true
true == [1] // true
false == [] // true
false == [0] // true
```

**数组转换为原始类型**

1. 会调用`join`方法，将数组元素用逗号连接起来。
2. 如果数组为空，则返回空字符串。
3. 只有一个元素且为纯数字时，返回该数字，否则返回NaN。
4. 两个元素时会返回NaN 。

```js

+[] // 0
+[11] // 11
+[11,12] // NaN
+['11'] // 11
+['abc'] // NaN
+['11', 'def'] // NaN

[] == 0 // true
[] == '' // true
[0] == 0 // true
[1] == 1 // true
[1,2] == '1,2' // true
[1,2] == 0 // false
```