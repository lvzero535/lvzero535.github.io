# JavaScript节流

节流就是持续触发的事件，每隔一段时间，只执行一次。如鼠标移动触发的事件，如果太频繁，导致性能问题，就需要用到节流。

根据首次是否执行以及尾次是否执行，实现也是不同。使用leading和trailing分别判断首尾是否执行。

节流的实现有两种方式，一：时间戳，二：是定时器。

## 使用时间戳

当事件触发时，取出当前的时间戳，然后减去之前的时间戳（一开始设置为0），如果大于设置的间隔时间就执行，然后更新时间戳为当前时间戳为下次使用，小于就不执行。

```javascript
// 第一版，时间戳, 默认是首次执行的
function throttle(fn, wait) {
  var context, 
  previous = 0;
  return function(...rest) {
    context = this,
    now = +new Date;
    if(now - previous > wait) {
      fn.apply(context, rest);
      previous = +new Date;
    }
  }
}
```



## 使用定时器

```javascript
// 第二版，定时器, 默认是首次不执行的,尾次执行
function throttle(fn, wait) {
  var timer, context;
  return function(...rest) {
    context = this;
    if(!timer) {
      timer = setTimeout(function(){
        fn.apply(context, rest);
        timer = null;
      }, wait)
    }
  }
}
```

## 结合版本

如果首尾都执行，可以结合这个两个版本

```javascript
function throttle(fn, wait) {
  var timeout, context, args,
      previous = 0;

  var later = function() {
    previous = +new Date;
    timeout = null;
    fn.apply(context, args)
  }

  return function() {
    var now = +new Date;
    // 下次触发剩余时间，
    // previous 首次是0， remaining是负数，所以首次必然会执行
    // 执行过一次后，previous是上次执行的时间
    // 再次触发时，就是现在的时间和上次执行时间的差值和时间周期的差值就是下次执行剩余的时间
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    // 或者你修改了系统时间，当前你修改系统时间时，
    // 如果多次触发事件时，remaning一样会减少，当前小于等于0时，说明等待时间周期到了，要执行
    // remaining > wait 的情况就是 now 小于 previous的情况，这是修改了系统时间
    if( remaining <=0 || remaining > wait) {
      if(timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      fn.apply(context, args);
      // 在有剩余时间触发后，还后保证之后再执行一次
    } else if (!timeout) {
      timeout = setTimeout(later, remaining);
    }
  }
}

```

网上还有一种方法这样写，比较简洁，就是用第二版

```javascript
function throttle(fn, wait) {
  var timer, context;
  return function(...rest) {
    context = this;
    if(!timer) {
      timer = setTimeout(function(){
        fn.apply(context, rest);
        timer = null;
      }, wait);
       // 立即执行
      fn.apply(context, rest);
    }
  }
}
```

## Underscore版本

```javascript
// 像underscore 一样的版本
// options.leading : false 首次不执行
// options.trailing : false 尾次不执行
function throttle(fn, wait, options) {
  var context, args, result,
      timer, previous = 0;
      // 最后一次执行的函数
      if (!options) options = {};
      var later = function () {
        // 执行到这里，说明不是第一次触发事件了，所以这里如果下一次触发的首次不执行
        previous = options.leading === false ? 0 : new Date().getTime();
        timer = null;
        result = fn.apply(context, args);
        // 垃圾回收
        if(!timer) context = args = null;
      }
  return function() {
    var now = +new Date;
    // 第一次触发，且首次不执行的
    if(!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if(remaining <=0 || remaining > wait) {
      if(timer) {
        clearTimeout(timer);
        timer = null;
      }
      previous = now;
      result = fn.apply(context, args);
      if(!timer) context = args = null;
    } else if(!timer && options.trailing !== false) {
      timer = setTimeout(later, remaining);
    }
    return result;
  }
}
```

注意：

1、`underscore` 的版本里，如果`leading`和`traiding`同时设置为`false` ,再再下次触发时由于没有timer且，上次执行时有`previous = now，`所以这时remaining`为负的，所以会相当于立即执行，就相`leading:false` 时冲突了，相当于bug吧。

2、return result在`trailing !== false` 时，最后一次没用，如果 `fn`是异步的也没用。