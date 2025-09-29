# JS深拷贝

> 当你想修改某个数据但又不影响原来的数据时就需要对原数据进行拷贝。`JS`来说，基本数据的赋值是基于值的没啥影响，但是对象的赋值是基于地址的，这就有影响，具体可以看下`JS`的数据存储。

## 浅复制
浅复制，只复制第一层，更新深层的还是基于地址的赋值，如数组`[].concat(origin); origin.slice();`对象`Object.assgin({}, origin)`这个简单，不多说。



## 深拷贝

先来说个最简单的，如果数据很简单，就是单纯的对象数据，可以使用`JSON.parse(JSON.stringify())`

但是这个对简单的就可以，对复杂的对象是有问题的。



- 当对象通过 JSON.stringify()转换成字符时有些属性值的字据类型会被忽略：

> `Function, Symbol, undefined` ，



- 数组通过 JSON.stringify()转换成字符时有些属性值的字据类型会被转成null

> `Function, Symbol, undefined` 



- JSON.stringify()转换过程中，正则对象侧是转成一个空对象、内部有循环引用时，会报错。



复杂的对象深拷贝要考虑的有两个问题：`循环引用` 和 `对象层次深` 这两个问题，用递归的话都会有超出内在问题。

首先，`循环引用`可以用一个数组把遇到的对象（需要遍历的）都保存起来，对于后面的对象复现可以判断是否已遍历过，遍历过的直接赋值就可以，这样就不会因为循环引用而无限循环赋值了。

对象层次很深时，对于递归，会出现爆栈。深层次的递归可以用尾调优来解决，但是这个深拷贝貌似不好用这个方法，可以用循环来拷贝，直接上代码，用注释来解释。

```javascript
// 查找 是否已保存过的，用来解决循环引用问题
function find(uniqueList, target) {
  for(let i=0; i<uniqueList.length; i++) {
    if (uniqueList[i].origin === target) {
      return uniqueList[i];
    }
  }
  return false
}

// 需要递归复现的类型，正常来说就这两个需要，这里没有考虑 Set 和 Map，
function isTypeOfCall(val) {
  let type = Object.prototype.toString.call(val).slice(8, -1);
  return ['Array', 'Object'].includes(type);
}


// *************递归深拷贝********************
function recursionDeepClone(source) {
  // 保存需要递归的对象，主要解决循环引用问题
  let uniqueList = [];

  return (function stack(source) {
    // 判断是数组还是对象
    let ret = Array.isArray(source) ? [] : {};
    // 需要递归的保存起来
    uniqueList.push({
      origin: source, // 旧值，用来对比是否已经遍历过
      target: ret // 新值，遍历过的新值保存在这里，后面直接用这个赋值就可以了，这个是新的对象，不能用原来的，不然有问题
    });

    for(let key in source) {
      // 判断是否是数组或是对象
      if (isTypeOfCall(source[key])) {
        // 查找是否已复制的对象
        let uniqueData = find(uniqueList, source[key]);

        if (!uniqueData) {
          // 没有，递归
          ret[key] = stack(source[key])
        } else {
          // 保存的是新值
          ret[key] = uniqueData.target;
        }
      } else {
        // 其他的直接赋值就可以了
        ret[key] = source[key]
      }
    }
    return ret;
  })(source)
}

// *************循环深拷贝********************
function stackDeepClone(source) {
  // 判断是数组还是对象
  const ret = Array.isArray(source) ? [] : {};
  const uniqueList = [];
  // 只有对象和数组需要对属性进行遍历赋值
  // 在循环过各把遇到的没遍历过的存进这里，当这个数组为空时就是拷贝完成了
  // 这里只有循环，没有递归，可以解决深层次对象的递归爆栈问题
  const stack = [{
    data: source, // 旧的对象
    parent: ret // 需要遍历对象的新值，保存在这里
  }];

  while(stack.length) {
    const res = stack.shift();
    const data = res.data; // 老对象数据
    const parent = res.parent // 新对象保存老对象的数据

	// 每次新遍历都要保存起来
    uniqueList.push({
      origin: data,
      target: parent
    })

    for (let key in data) {
      if (isTypeOfCall(data[key])) {
        const uniqueData = find(uniqueList, data[key]);
        if (!uniqueData) {
          // 新值要重新创建，并先赋值给上一层的对象属性，下次遍历就可以给这个对象赋值了
          parent[key] = Array.isArray(data[key]) ? [] : {};
          stack.push({
            data: data[key],
            parent: parent[key]
          })
        } else {
          // 这个已经遍历过了，直接赋值
          parent[key] = uniqueData.target;
        }
      } else {
        parent[key] = data[key];
      }
    }
  }
  return ret;
}
```



如果用了第三方库的，如`underscore,lodash,jQuery` 等都有深复制的函数，不需要自己写，自己写只是为了了解对象的复制可能存在哪些问题，还有应对可能的面试。
