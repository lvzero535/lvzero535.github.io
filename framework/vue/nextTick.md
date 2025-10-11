# Vue中nextTick的实现原理

## 官方文档

[nextTick](https://cn.vuejs.org/api/general.html#nexttick) 官方文档介绍了用法：

等待下一次 DOM 更新刷新的工具方法。

- **详细信息**

当你在 Vue 中更改响应式状态时，最终的 DOM 更新并不是同步生效的，而是由 Vue 将它们缓存在一个队列中，直到下一个“tick”才一起执行。这样是为了确保每个组件无论发生多少状态改变，都仅执行一次更新。

`nextTick()` 可以在状态改变后立即使用，以等待 DOM 更新完成。你可以传递一个回调函数作为参数，或者 await 返回的 `Promise`。

- **示例**

```vue
<script setup>
import { ref, nextTick } from 'vue'

const count = ref(0)

async function increment() {
  count.value++

  // DOM 还未更新
  console.log(document.getElementById('counter').textContent) // 0

  await nextTick()
  // DOM 此时已经更新
  console.log(document.getElementById('counter').textContent) // 1
}
</script>

<template>
  <button id="counter" @click="increment">{{ count }}</button>
</template>
```

## Vue的渲染更新机制

当你修改Vue的响应式数据时，例如：

```ts
const count = ref(0);
count.value++;
```

Vue不会立即更新和count数据有关的DOM，而是将**更新操作**缓存到一个异步更新队列中，然后在本轮事件循环结束后，将队列中的更新操作批量执行。

- **更新步骤**

1. 数据变化时，触发响应式更新。

```ts
const count = ref(0);
effect(function render() {
  count.value++;
})

```

2. Vue会将更新操作添加到异步更新队列中。

```ts
queueJob(render)
```

- **`queueJob()`** 会做如下事情：

```ts
// Vue 内部源码片段（简化）
const queue = []
let isFlushPending = false
const resolvedPromise = /*#__PURE__*/ Promise.resolve() as Promise<any>
let currentFlushPromise: Promise<void> | null = null

function flushJobs() {
  isFlushPending = false
  isFlushing = true

  queue.sort(comparator)

  try {
    for (flushIndex = 0; flushIndex < queue.length; flushIndex++) {
      const job = queue[flushIndex]
        // console.log(`running:`, job.id)
        callWithErrorHandling(job, null, ErrorCodes.SCHEDULER)
      }
    }
  } finally {
    flushIndex = 0
    queue.length = 0

    flushPostFlushCbs(seen)

    isFlushing = false
    currentFlushPromise = null
    if (queue.length || pendingPostFlushCbs.length) {
      flushJobs(seen)
    }
  }
}

export function queueJob(job: SchedulerJob) {

  if (
    !queue.length ||
    !queue.includes(
      job,
      isFlushing && job.allowRecurse ? flushIndex + 1 : flushIndex
    )
  ) {
    if (job.id == null) {
      queue.push(job)
    } else {
      queue.splice(findInsertionIndex(job.id), 0, job)
    }
    queueFlush()
  }
}

function queueFlush() {
  if (!isFlushing && !isFlushPending) {
    isFlushPending = true
    currentFlushPromise = resolvedPromise.then(flushJobs)
  }
}

```

也就是说，当有多个状态改变时，把这些状态放到一个队列中，Vue会将这个队列包装成一个`flushJobs`放在微任务里。

## nextTick的实现

### vue3中的nextTick实现

vue3中很简单，就是生成一个微任务，将回调函数放到这个微任务中执行。 `currentFlushPromise`是当前正在打算异步更新响应数据的微任务，如果存在就放在后面，不存在就创建一个新的微任务。

```ts
export function nextTick<T = void, R = void>(
  this: T,
  fn?: (this: T) => R
): Promise<Awaited<R>> {
  const p = currentFlushPromise || resolvedPromise
  return fn ? p.then(this ? fn.bind(this) : fn) : p
}
```

nextTick就是在“DOM 更新任务 flushJobs 已经排队”之后，再往同一个微任务队列里加一个新的回调。
这里的微任务队列： `[flushJobs, nextTickCallback]`

- flushJobs（Vue 的 DOM 更新）先执行；
- nextTick 回调在 DOM 更新之后执行；
- 所以你能拿到更新后的 DOM 节点。

### vue2中的nextTick实现

vue2中的nextTick实现和vue3不一样，vue2中判断了是否存在Promise, MutationObserver，没有就用setTimeout模拟一个。

```ts
// vue2中的nextTick实现和vue3不一样，vue2中判断了是否存在Promise，没有就用setTimeout模拟一个。

// 浏览器环境下，判断是否存在 Promise 构造函数，且是原生实现
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  timerFunc = () => {
    p.then(flushCallbacks)
    if (isIOS) setTimeout(noop)
  }
  isUsingMicroTask = true
} else if (
  !isIE &&
  // 浏览器环境下，判断是否存在 MutationObserver 构造函数，且是原生实现
  typeof MutationObserver !== 'undefined' &&
  (isNative(MutationObserver) ||
    MutationObserver.toString() === '[object MutationObserverConstructor]')
) {

  let counter = 1
  const observer = new MutationObserver(flushCallbacks)
  const textNode = document.createTextNode(String(counter))
  observer.observe(textNode, {
    characterData: true
  })
  timerFunc = () => {
    counter = (counter + 1) % 2
    textNode.data = String(counter)
  }
  isUsingMicroTask = true
} else if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  timerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else {
  timerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

export function nextTick(cb?: (...args: any[]) => any, ctx?: object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e: any) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    timerFunc()
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```

## 这时nextTick中的DOM已渲染到浏览器了吗？

浏览器的渲染大致：JS 宏任务 → 微任务 → 渲染（Reflow/Repaint） → 下一帧

按以上顺序执行，nextTick 回调在 DOM 更新之后，但在渲染之前执行。也就是说，这里能拿到更新后的 DOM 节点，但渲染还没有开始。

## Vue 响应式更新 + nextTick + 渲染全过程

- **1. 宏任务阶段**

  - 修改响应式数据：this.count++  
    - 触发依赖收集器 watcher / effect  
    - Vue 调用 queueJob(updateComponent)（将组件更新任务放入微任务队列中）  
  - 调用 this.$nextTick(() => {...}) 
    - Vue 再向同一个微任务队列中推入 nextTick 回调
  - 当前微任务队列 = [ flushJobs, nextTickCallback ]

- **2. 微任务阶段（Promise.then 队列）**
 
  - 执行 flushJobs → 组件重新渲染 → Virtual DOM diff → Patch 更新真实 DOM
  - 执行 nextTickCallback → 此时 DOM 已经更新（但未绘制到屏幕）

- **3. 渲染阶段（Reflow + Paint）**

浏览器判断需要重绘 → 执行一次布局和绘制 → 屏幕呈现最新内容

## 总结

| 阶段                    | 操作                   | 所属任务类型 | 是否可见更新 | 说明                             |
| --------------------- | -------------------- | ------ | ------ | ------------------------------ |
| 修改数据                  | `this.count++`       | 宏任务    | ❌ 否    | Vue 收集依赖、标记组件待更新               |
| Vue 更新 DOM            | `flushJobs()`        | 微任务    | ❌ 否    | 更新 Virtual DOM → Patch 到真实 DOM |
| `this.$nextTick()` 回调 | `nextTickCallback()` | 微任务    | ❌ 否    | 可读取“更新后的 DOM 结构”，但未绘制到屏幕       |
| 浏览器渲染                 | `reflow + repaint`   | 渲染阶段   | ✅ 是    | 屏幕显示最新 DOM                     |
