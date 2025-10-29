
# Vue2中的new Vue() 做了什么？


[参考](https://v2.cn.vuejs.org/v2/guide/instance.html#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F%E5%9B%BE%E7%A4%BA)
![](./images/vue2-lifecycle.png)


- 在 new Vue 的时候，内部会进行初始化操作。
- 内部会初始组件绑定的事件，初始化组件的父子关系 `$parent,$children,$root` 等。
- 初始化响应式数据data/computed/props/watch/methods。同时也初始化了provide和inject方法。内部会对数据进行劫持 对象采用defineProperty数组采用方法重写。
- 在看下用户是否传入了el属性和template或者render。render的优先级更新 ，如果用户写的是template，会编译成render函数。
- 内部挂载的时候会产生一个watcher，调用render函数， 会触发依赖收集。内部还会给所有的响应式数据添加一个dep属性，让属性dep记住这个watcher。（用户后续修改数据时会触发watcher重新渲染）
- vue更新的时候会采用diff算法，对比新旧虚拟DOM树，找出差异，只更新有差异的节点。

## 1. `new Vue()`

1. Vue构造函数在`src\core\instance\index.ts` 中定义。 调用用了`this._init()` 方法。
2. `this._init()` 方法在`src\core\instance\init.ts` 中在`Vue.prototype`上定义。  

## 2. `init Events & Lifecycle`

1. `initEvents` 初始化事件，会将事件绑定到组件实例上。
   - 代码在`src\core\instance\events.ts`上
   - 组件通过`$on`、`$emit`、`$off`等方法来触发和监听事件。

2. `initLifecycle` 初始化生命周期，实际上是确定组件的关系，确定组件的父组件、子组件、根组件等和一些变量。
   - 代码在`src\core\instance\lifecycle.ts`上。

## 3. 开始调用beforeCreate生命周期钩子函数

`src\core\instance\init.ts` 65行

## 4. `init injections & reactivity`

1. `initInjections` 初始化依赖注入，会将父组件的依赖注入到子组件中。
   - 代码在`src\core\instance\inject.ts`上。
2. `initProvide` 初始化提供依赖， 将组件上的provide属性的值正常化对象后，将对象的属性作为依赖提供给子组件。
   - 代码在`src\core\instance\inject.ts`上。
3. `initState` 初始化状态，会初始化组件的data/computed/props/watch/methods等状态。
   - 代码在`src\core\instance\state.ts`上。
   - 这个时候，开始遍历data/computed/props/watch/methods等状态，将它们转换为响应式数据。
   - 注意：对于methods属性，会通过`bind`方法将方法绑定到组件实例上，也就是说，绑定后是一个新的函数，所以不要在methods中使用箭头函数或给函数添加属性，否则会导致属性丢失。

## 5. 开始调用created生命周期钩子函数

`src\core\instance\init.ts` 69行

## 6. 判断是否有el属性

`src\core\instance\init.ts` 78行

1. 有el属性，会调用`$mount`方法挂载组件。
2. 没有el属性，会等待用户调用`$mount`方法挂载组件。

## 6. 判断是否有template属性

`$mount` 方法

1. `$mount` 方法在`src\platforms\web\runtime\index.ts` 中定义, 这里会直接调用mountComponent方法。

2. `$mount` 方法在`src\platforms\web\runtime-with-compiler.ts` 中也定义了，但它会判断是否会有template，如果有会编译成render函数，但它最终会调用第1步的`$mount` 方法。
   - 判断是否有template属性，如果有，会编译成render函数。
   - 如果没有template属性，会判断是否有el属性，如果有，会将el的outerHTML作为template。

## 7. 开始调用beforeMount生命周期钩子函数

`src\core\instance\lifecycle.ts` 177行

## 8. 创建$el属性替换el

## 9. mounted和更新渲染

在调用mounted生命周期钩子函数之前，调用一个Watcher， 在Watcher中调用render函数，触发依赖收集， 并将渲染结果挂载到$el属性上。

更新渲染后调用 mounted 生命周期钩子函数
`src\core\instance\lifecycle.ts` 241行。

当前依赖更新时，Watcher会先调用`beforeUpdate生`命周期钩子函数

`src\core\instance\lifecycle.ts` 207行。

当Watcher执行完更新后，会调用`updated`生命周期钩子函数。
`src\core\observer\scheduler.ts` 139行。

## 10. 销毁

当用户调用`$destroy`方法时
`src\core\instance\lifecycle.ts` 108

1. 会调用`beforeDestroy`生命周期钩子函数, 之后会做一些清理操作。
2. 清理完后会调用`destroyed`生命周期钩子函数。
