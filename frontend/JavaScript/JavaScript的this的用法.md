# JavaScript的this的用法

## 函数调用

> 直接调用函数时，不管调用位置如何（函数内或函数外），this都指向全局对象window。
>
> **注意：**在严格模式下，这种用法是不允许，this返回值是undefined

```javascript
function foo(x){
    this.x =x;
}
foo(2);
console.log(x)//2
```

## 对象调用

> 当函数作为对象的方法调用时，函数内的this指向当前调用对象
>
> 以下代码中this指向p对象，即当前对象，而不是window

```javascript
 var n = "true";
 var p = {
     n : "false",
     m : function(){
         console.log(this.n);
     }
 }
p.m()//"false"
```

## 构造函数

> 在构造函数中，this指向新创建的实例对象。
>
> 以下代码，函数内部的this指向新创建的对象f

```javascript
function F(x){
    this.x = x;
}
var f = new F(5);
console.log(f.x);//5
```

## 内部函数

> 内部函数,相当于直接调用函数所以this指向window

```javascript
 var n = "true";
 var p = {
     n : "false",
     m : function(){
         var say = function(){
             console.log(this.n);
         }
         say();
     }
 }
 p.m();//true
```

> 要使用this指向p对象，代码修改如下

```javascript
 var n = "true";
 var p = {
     n : "false",
     m : function(){
         var that = this;
         var say = function(){
             console.log(that.n);
         }
         say();
     }
 }
 p.m();//false
```

