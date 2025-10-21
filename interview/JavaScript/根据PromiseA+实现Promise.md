# 根据PromiseA+实现一个自己的Promise

[规范PromiseA+](https://malcolmyu.github.io/malnote/2015/06/12/Promises-A-Plus/)

```js
class MyPromise {
    constructor(executor) {
        // 一个Promise的当前状态必须为以下三种状态中的一种：等待态 pending，执行态 fulfilled，拒绝态 rejected
        
        // 等待态 pending，promise必须满足：可以迁移至 执行态 或 拒绝态
        this.state = 'pending'; //  // 保持promise的状态
        
        // 执行态 fulfilled 时 promise必须满足：
        // 不能迁移至其他任何状态
        // 必须拥有一个不可变的终值
        this.value = undefined; //  执行态时保存的值，最终状态之一，不可变
        
        // 拒绝态 rejected 时 promise必须满足：
        // 不能迁移至其他任何状态
        // 必须拥有一个不可变的根因
        this.reason = undefined; // 拒绝态时保存的根因，最终状态之一，不可变
        
        this.onFulfilledCbs = [];
        this.onRejectedCbs = [];
        
        const resolve = (value) => {
            // 这里只有状态为pending时才可以变成fulfilled
            if (this.state === 'pending') {
                this.state = 'fulfilled';
                this.value = value;
                // then方法可以多次调用，then的参数里注册的方法按钮注册的顺序调用
                this.onFulfilledCbs.forEach(cb => cb());
            }
        }
        
        const reject = (reason) => {
            // 这里只有状态为pending时才可以变成rejected
            if (this.state === 'pending') {
                this.state = 'rejected';
                this.reason = reason;
                // then方法可以多次调用，then的参数里注册的方法按钮注册的顺序调用
                this.onRejectedCbs.forEach(cb => cb());
            }
        }
        
        try {
            executor(resolve, reject)
        } catch(e) {
            // 当构造函数报错时，要变成 rejected状态
            // 浏览器的报错被吃掉，但是node会错误
            reject(e);
        }
    }
    
    // onFulfilled 和 onRejected 都是可选。
    then(onFulfilled, onRejected){
    
        // 如果 onFulfilled 不是函数，被忽略。
        // 也就是说，当前promise是的value是什么，then返回的promise就是什么value
        onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : (value) => value;
        
        // 如果 onRejected 不是函数，被忽略。
        // 也就是，当前promise的reason是什么，then返回的promise就是什么reason
        onRejected = typeof onRejected === 'function' ? onRejected : (reason) => { throw reason;}
        
        // then方法返回一个新的Promise
        const promise2 = new MyPromise((resolve, reject) => {
            // 多次调用then值时获取的终值是一样的
            if (this.state === 'fulfilled') {
                // queueMicrotask 执行微任务
                queueMicrotask(() => {
                    try {
                        // onFulfilled必须被调用一次，第一个参数为终值
                        // 必须作为函数调用，没有this值
                        const x = onFulfilled(this.value);
                        // 返回值要走处理过过程，解决x可能是promise
                        MyPromise.resolvePromise(promise2, x, resolve, reject);
                    } catch(e) {
                        reject(e);
                    }
                });
            } else if (this.state === 'rejected') {
                queueMicrotask(() => {
                     try {
                         // onFulfilled必须被调用一次，第一个参数为根因
                         // 必须作为函数调用，没有this值
                        const x = onRejected(this.reason);
                        // 返回值要走处理过过程，解决x可能是promise
                        MyPromise.resolvePromise(promise2, x, resolve, reject);
                    } catch(e) {
                        reject(e);
                    }
                });
            } else if (this.state === 'pending') {
                // 当前promise，还没执行的，先收到到队列，后面按钮顺序执行
                this.onFulfilledCbs.push(() => {
                    queueMicrotask(() => {
                        try {
                            const x = onFulfilled(this.value);
                            MyPromise.resolvePromise(promise2, x, resolve, reject);
                        } catch(e) {
                            // onFulfilled抛出异常，promise2要reject
                            reject(e);
                        }
                    });
                });
                this.onRejectedCbs.push(() => {
                    queueMicrotask(() => {
                         try {
                            const x = onRejected(this.reason);
                            MyPromise.resolvePromise(promise2, x, resolve, reject);
                        } catch(e) {
                            // onRejected抛出异常，promise2要reject
                            reject(e);
                        }
                    });
                });
            }
        
        })
        
        return promise2;
        
    }
    
    static resolve(value) {
        return new MyPromise(resolve => resolve(value));
    }
    static reject(reason) {
        return new MyPromise((_, reject) => reject(reason));
    }
    
    static resolvePromise(promise2, x, resolve, reject) {
        if (promise2 === x) {
            reject(new TypeError('Chaining cycle detected for promise'))
        }
        
        if (x && (typeof x === 'object' || typeof x === 'function')) {
            let called = false;
            try {
                // 如果 x 是一个对象或函数，并且有一个名为 then 的属性，我们认为它是一个 Promise。
                // 我们将 x.then 赋值给 then，然后检查 then 是否是一个函数。
                // 如果 then 是一个函数，我们将 x 作为 this 调用 then，并传递两个回调函数：resolvePromise 和 rejectPromise。
                // 如果 then 不是一个函数，我们将 x 作为值传递给 resolvePromise。
                // 如果在调用 then 时抛出了一个异常 e，我们将 e 作为原因传递给 rejectPromise。
                // 如果 then 是一个函数，并且它已经被调用过，我们将忽略这个调用。
                // 如果 then 是一个函数，并且它还没有被调用过，我们将它作为函数调用，并传递 x 作为 this。
                const then = x.then;
                if (typeof then === 'function') {
                    then.call(
                        x,
                        (y) => {
                            if (called) return;
                            called = true;
                            MyPromise.resolvePromise(promise2, y, resolve, reject)
                        },
                        (r) => {
                            if (called) return;
                            called = true;
                            reject(r);
                        }
                    )
                } else {
                    resolve(x);
                }
            } catch(e) {
                if (called) return;
                called = true;
                reject(e);
            }
        } else {
            // x不为函数或对象时，直接resolve
            resolve(x)
        }
    }
}
// 为 promises-aplus-tests 测试提供接口
MyPromise.deferred = function () {
  let resolve, reject;
  const promise = new MyPromise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

module.exports = MyPromise;


```