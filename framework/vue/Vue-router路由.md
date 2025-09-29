# Vue-router路由

## 动态路由

> 动态路由是通过在路由中添加参数来实例渲染不同的数据，如果一个用户组件渲染不同用户。
>
> /user/:id --->  /user/foo:/user/bar
>
> /user/:id/posts/:postid --->  /user/foo:/user/bar
>
> 这个参数可以在路由对象中获取。如组件方法中：this.$route.params.id
>
> **注意:** 使用路由参数时，由于两个路由渲染的是同一个组件，为了高效，组件实例会复用。不过这样会导致生命周期钩子函数不会调用。也不会触发进入、离开的导航守卫。

## 组件中的路由对象

可以在组件中通过 `this.$route`调用路由对象，`this.$router`调用路由实例。

在组件中获取路由参数或路由查询参数时：

`this.$route.params`  是一个对象，里面包含所有路由参数。

`this.$route.query` 是一个对象，里面包含所有路由查询参数。

> 使用 `props` 将组件和路由解耦： 无需在组件内调用$route，在配置路由时加上props属性
>

```javascript
{
  path: '/user',
  component: User,
  props: true
}
// props: Boolean | Object | Function
// props: true, // 这时 route.params 将会设置为组件属性
// props: Object, // 整个对象原样设置为组件属性
// props: (route) => ({name: route.query.name}), // 函数返回的内容设置为组件属性
```



## 守卫导航

```javascript
function callback(to, from, next) {
  // to: Route：即将要进入的目标路由对象。
  // from: Route：当前导航正要离开的路由对象。
  
  // next: Function，相当于中间件的next方法或是promise的resolve。
  // next()：进入下一个守卫的函数。如果不调用该函数，当前导航一直在等待中。
  // next(false): 中断当前的导航，URL地址重置到 from 路由。
  // next('route路由对象')：不跳到 to 目标路由，跳到自定义路由上。这可以判断该用户在此路由是否有权限，没有就跳到指定路由页面。
  // next(error)：导航中止，如果router.onError(callback)函数有注册，则error传参给callback；没注册则报出异常。
}
function afterCallback(to, from) {
  // to: Route：即将要进入的目标路由对象。
  // from: Route：当前导航正要离开的路由对象。
}

beforeEach(callback) 
// 全局前置守卫，所有路由进入前都会执行。
afterEach(afterCallback) 
// 全局后置钩子，所有路由导航结束后都会执行。
beforeResolve(callback) 
// 解析守卫，在路由独享守卫（beforeEnter），和组件内守卫（beforeRouteEnter）之后执行。
beforeEnter(callback)
// 路由独享守卫，在全局前置守卫(beforeEach)之后执行。
beforeRouteEnter(callback)
// 组件内守卫，在路由独享守卫之后执行。
// 在渲染该组件的对应路由被confirm前调用
// 不~能~获取组件实例 `this`
// 因为当守卫执行前，组件实例还没有被创建。
// 可以在next参数回调函数的参数中传入实例对象
// next((vm) => {vm.props}) callback 回调函数在DOM更新后执行也就是 mounted之后执行。

beforeRouteUpdate(callback)
// 组件内守卫，第一次进入该路由时不会触发，只有在当前路由中，改变该路由时才会触发
// 如 对于一个带有动态参数路径/user/:id，在 /user/1和/user/2之间跳转时才会触发。
//　由于渲染同一个组件user ，会复用。
// 可以访问组件实例 this， next 不支持传递回调

beforeRouteLeave(callback) 
// 组件内守卫，离开该路由时触发，可以访问 实例this。也不支持传递回调

```

> 所以路由守卫有两种执行顺序
>
> **正常路由:**
>
> ​	beforeEach(全局前置守卫) 
>
> ​	beforeEnter(路由独享守卫) 	
>
> ​	beforeRouteEnter(组件内守卫) 
>
> ​	beforeResolve(解析守卫) 
>
> ​	afterEach(全局后置钩子)
>
> 【**没有：** beforeRouteUpdate(组件内守卫)，beforeRouteLeave(组件内守卫)】
>
> **路由复用:**
>
> ​	beforeEach(全局前置守卫)
>
> ​	beforeRouteUpdate(组件内守卫)
>
> ​	beforeResolve(解析守卫) 
>
> ​	afterEach(全局后置钩子)
>
> 【**没有：** beforeEnter(路由独享守卫) ，beforeRouteEnter(组件内守卫)， beforeRouteLeave(组件内守卫)】
>
> **注意** ：
>
> 1、以上的执行顺序是所有守卫里 next() 函数前执行的顺序。
>
> 2、next函数后的内容是反过来执行，整个路由守卫执行过程就是一个递归调用栈。
>
> 3、组件所有生命周期的钩子在守卫之后执行。