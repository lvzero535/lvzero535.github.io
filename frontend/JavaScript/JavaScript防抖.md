# JavaScript防抖

防抖就是持续触发的事件中，最后一个事件触发时在一定时间周期后再执行这个事件。

也就是说，每次触发事件，如果这个事件还没执行，那么之前触发的事件会清除，以最后一个事件为主，等待的时间会重新开始。

当然也会分第一次是否执行。

## 第一版

简单的实现

```javascript
// 第一版，时间戳, 默认是首次执行的
function debounce(fun, wait) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      fun.apply(context, args);
    }, wait);
  }
}
```



## 第二版

第三个参数是第一次是否执行。

当前`immediate` 为 true时，判断 `first` 是否第一次执行，第一次执行后，改变first的值，下次再触发就不再立即执行，最后一次执行是定时器里，要first复原，等待下次第一次执行。

result返回结果只有第一次会有效。

```javascript
function debounce(fun, wait, immediate) {
  var timeout, fisrt, result, context, args;
  return function() {
    context = this, args = arguments;
    if(immediate && !fisrt) {
      fisrt = true;
      result = fun.apply(context, args);
    }
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      fisrt = false;
      fun.apply(context, args);
      timeout = args = context = null;
    }, wait);
    return result;
  }
}
```

