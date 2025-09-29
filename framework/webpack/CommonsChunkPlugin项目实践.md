# CommonsChunkPlugin项目实践

## 前言
每次打开项目代码，看到两个new Vue，还有重复引用的`Vue.prototype.xx = xx`，就觉得很奇怪。历史原因吧，一个项目两个`html`页面，一个登录页面引入`Vue`，`new`了一次，挂载各种资源。登录成功后，跳到主页面又`new`了一次`Vue`，还是和登录页面一样挂载各种资源，如`lodash,i18n`。用`webpack-bundle-analyzer`插件看下打包后的依赖是啥情况。一看构建后的代码大小有五点多M，发现很多代码是重复打包的。看了下构建配置，`vue-cli3`生成的，没动过，是原来的配置，webpack是v3版本的。难怪这样，最后`CommonsChunkPlugin`配置下，分开了重复打包的代码，看下最后打包的大小只有三点多M了。内网看不到构建结果，这里记录下这次过程。

## CommonsChunkPlugin部分配置

`CommonsChunkPlugin` 的用法网上很多这里，这里简单的说下。
 
 `name` ：和入口的 key 相同的，会把公共代码合入到这个入口的`chunk`中的，如果不存在就新创建一个`chunk`。
 
`children`: 从每个入口递归查询所有子`chunk`的公共模块，分离出来到对应的入口`chunk`，(入口的`chunk`的公共模块不会被分离的。)

`async`：使用`children`时，把公共模块加入到入口文件，会使用入口文件比较，使用这个属性可以把公共模块独立出来自己生成一个chunk。生成的`chunk` 可以和入口文件并行加载。

`chunks`：一个数组，指定从哪些chunk来源分离公共模块，也就是说从哪些`chunk`开始遍历分离公共模块。不能和`children`一起使用，因为`children`默认是从所有入口`chunk`开启遍历的。

`minChunks`：值可以是数字，被多少`chunk`引用时被分离;可以是函数更精细化的控制；还可以是`Infinity`。

## 项目配置
### 原因
说下项目为什么有些公共代码没有被分离出来。
看下`CommonsChunkPlugin`的配置:
```javascript
new webpack.optimize.CommonsChunkPlugin({
  name: 'vendor',
  minChunks(module, count) {
    return module.resource && (/node_modules/).test(module.resource);
  }
}),
new webpack.optimize.CommonsChunkPlugin({
  name: "manifest",
  minChunks: Infinity
}),
new webpack.optimize.CommonsChunkPlugin({
  name: 'app',
  minChunks: 3,
  async: true,
}),

```
大体上是这样子的。
有哪些重复代码没有被分离出来呢？
 - 第一部分是：两个入口文件都引用了公共组件和国际化，这部分代码没有被分离出来。
 - 第二部分是：主页面入口的异步子模块的公共模块没被分离出来。

从上面的配置上看都没有分离这些代码的逻辑。
### 解决
第一部分要从两个入口遍历，至少被引用2次。
第二部分要从子模块去遍历。大体配置如下面这样的：
```javascript
// 入口模块
new webpack.optimize.CommonsChunkPlugin({
  minChunks: 2,
  name: 'app',
  chunks: ['login', 'page']
}),
// 子模块
new webpack.optimize.CommonsChunkPlugin({
  minChunks: 2,
  children: true, // 子模块
  async: 'async', // 分离
})

```
### 坑
这里有个坑，可能不太熟悉，把两个入口的页面公共代码分离出来后，测试的时候报错了，最后发现是依赖引入有误，也对，分离出来的公共代码没有引入肯定会报错的。
最后修改`html-webpack-plugin`插件的两个属性`chunks`，加上分离出来的`chunk`名称`app`,`chunksSortMode`改成`manual`

## 最后
实践和理论还是有区别的，虽然知道webpack大体的配置是怎么样，但是实践起来还是不太一样的，比如这次，虽然分离出来了，但是测试的时候报错了，一开始还以为自己配置写错了，纠结了好久，后面排查才知道依赖引用问题。


