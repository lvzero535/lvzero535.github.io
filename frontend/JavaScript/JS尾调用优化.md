# JS尾调用优化

## 尾调用优化

一个出现在另一个函数“结尾”处的函数调用，这个调用结束后函数执行完成。

调用一个新的函数需要额外的一块预留内存来管理调用栈，称为栈帧。

如果有一个函数在另一个函数尾部调用时，引擎能够意识后者函数已经完成了，那么前者不需要创建一个新的栈帧，重复使用老的栈帧，这样速度快，也更节省内存。

这样在深度递归调用时可以使用尾调用优化，避免内存益出。

```javascript
function foo(x) {
	return x;
}
function bar(y) {
	return foo( y + 1 ); // 尾调用
}
function baz() {
	return 1 + bar( 40 ); //bar函数完成后还要执行加法， 非尾调用
}
baz(); // 42
```

```javascript
function factorial(n) {
  function fact(n, res) {
    if(n<2) return res;
    return fact(n-1, n*res);
  }
  return fact(n, 1)
}
factorial(5) // 120 尾调用优化递归，
```
