# Webpack不同环境构建Hash不变

## 需求

在`webpack` 构建后，文件名称都会有一个`hash` 值，这个值的生成在`webpack` 的配置中有三种生成方式

`hash, chunkhash,contenthash` 。之前关注的一直是生成`hash` 相关的内容，如`hash` 和项目有关，`chunkhash` 和`chunk` 有关，`contenthash` 和`CSS` 提取有关。考虑到缓存，一般用`chunkhash,contenthash` 。

## 原因

从来没关注过不同环境同一份代码生成的`hash`有什么不同。直到有个需求，同一份代码在不同环境构建，生成的hash要一样，然而构建后测试发现竟然是不一样的，好神奇，毕竟相同的内容都是通过`md5` 和`hex` 生成的`hash`，然而搜索发现，生成`hash` 还会带上绝对路径的，也就是说同一份代码，同一环境不同路径最后生成的`hash` 都是不一样的，更不要说不同系统了。

## 低级解决办法

想要生成一样的`hash` 可以用同一个构建环境，但是有时候并没有统一的构建环境，又要一样的hash。`webpack` 提供了接口（`v3`没有，`v4`以上才有）,自己提供算法 `output.hasFunction` 

函数返回一个对象，包含两个函数。

`update`  函数的参数的文件内容

`digest` 函数返回的内容即是替换`[chunkhash]` 占位符的内容，注意这里如果返回的是一个固定值，那么每个文件的hash是一样的。

```javascript
output: {
    filename: '[name].[chunkhash].bundle.js',
    path: path.resolve(__dirname, 'dist'),
    hashFunction: function() {
      return {
        update(content) {
        },
        digest(hex) {
          return hex;
        }
      }
    }
  }
```

## 高级解决办法

怎么能每个`chunk` 根据自己的内容生成 `chunkhash` ？？？



参考

https://blog.csdn.net/qq_33594101/article/details/107981866
