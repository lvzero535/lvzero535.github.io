# Vue Core 调试指南

本文档用于帮助在 `vuejs/core` 仓库中调试 Vue 运行时、响应式系统、编译器和单文件组件相关问题。

适用对象：

- 想阅读 Vue Core 源码的开发者
- 想复现和定位框架 bug 的贡献者
- 想理解组件挂载、更新、销毁流程的学习者

## 1. 调试目标分类

在开始之前，先判断你要调的是哪一类问题。不同问题应该使用不同入口。

### 1.1 运行时问题

适合以下场景：

- `createApp`、组件挂载、更新、卸载
- 生命周期执行顺序
- `props`、`slots`、`attrs`
- 调度器 `scheduler`
- `render` / `patch`

重点目录：

- [packages/runtime-core](https://github.com/vuejs/core/blob/main/packages/runtime-core)
- [packages/runtime-dom](https://github.com/vuejs/core/blob/main/packages/runtime-dom)

### 1.2 响应式问题

适合以下场景：

- `reactive`
- `ref`
- `computed`
- `watch`
- 依赖收集与触发更新

重点目录：

- [packages/reactivity](https://github.com/vuejs/core/blob/main/packages/reactivity)

### 1.3 编译器问题

适合以下场景：

- 模板解析
- AST transform
- codegen
- 模板为什么会被编译成某段 render code

重点目录：

- [packages/compiler-core](https://github.com/vuejs/core/blob/main/packages/compiler-core)
- [packages/compiler-dom](https://github.com/vuejs/core/blob/main/packages/compiler-dom)

### 1.4 SFC 问题

适合以下场景：

- `.vue` 单文件组件
- `<script setup>`
- `<template>`、`<style>`、编译与运行时联动

重点目录：

- [packages/compiler-sfc](https://github.com/vuejs/core/blob/main/packages/compiler-sfc)
- [packages-private/sfc-playground](https://github.com/vuejs/core/blob/main/packages-private/sfc-playground)

## 2. 推荐调试入口

这个仓库已经提供了几条非常适合源码调试的入口。

### 2.1 调试运行时：`pnpm dev`

命令：

```bash
# 1. 启动 Vue 运行时调试服务器
pnpm dev

# 2. 启动本地 Vue 示例页面服务器
cd packages/vue
live-server
```

- 在 `packages/vue` 目录下运行服务器如：live-server，访问 `http://localhost:8080`后，即可查看 `packages/vue/example` 目录下的示例页面。在页面中，你可以调试 Vue 运行时的行为。

作用：

- 监听并构建 `vue` 包
- 默认输出开发版构建产物`packages/vue/dist/vue.global.js`
- 查看 `packages/vue/example` 目录下的示例页面。在页面中，即可以调试 `Vue源码`。

相关实现：

- [scripts/dev.js](https://github.com/vuejs/core/blob/main/scripts/dev.js)

适合调试：

- 组件创建
- 生命周期
- DOM patch
- 调度更新

### 2.2 调试 SFC：`pnpm dev-sfc`

命令：

```bash
pnpm dev-sfc
```

作用：

- 启动本地 SFC Playground
- 提供非常快的修改-刷新反馈回路
- 可以在 Playground 中调试 SFC 编译与运行时的`Vue源码`。

适合调试：

- `.vue` 文件编译结果
- `<script setup>`
- SFC 编译与运行时联动问题

相关目录：

- [packages-private/sfc-playground](https://github.com/vuejs/core/blob/main/packages-private/sfc-playground)

### 2.3 调试模板编译器：`pnpm dev-compiler`

命令：

```bash
# 1. 启动本地 Template Explorer
pnpm dev-compiler

# 2. 访问 http://localhost:8081
pnpm open

# 或访问 http://localhost:3000/packages-private/template-explorer/local.html
```

作用：

- 启动本地 Template Explorer
- 观察模板输入如何变成 render code
- 访问本地的template-explorer可以调试模板编译器的`Vue源码`。

适合调试：

- parser
- transform
- codegen
- 编译器优化标记

相关资料：

- [packages-private/template-explorer/README.md](https://github.com/vuejs/core/blob/main/packages-private/template-explorer/README.md)

### 2.4 调试具体 bug：`pnpm test`

命令示例：

```bash
pnpm test runtime-core
pnpm test reactive
pnpm test componentProps
pnpm test watch -t "should trigger"
```

作用：

- 直接用现有测试复现问题
- 适合最稳定、最可控的源码调试

推荐优先级：

1. 先找现有测试
2. 没有测试再用 playground
3. 再考虑手写最小复现页

## 3. 推荐工作流

### 3.1 先判断问题所属层

先问自己三个问题：

1. 是状态没更新，还是 DOM 没对？
2. 是模板编译错了，还是运行时执行错了？
3. 是单纯响应式问题，还是组件树问题？

经验上可以这样分：

- 状态追踪异常：先看 `reactivity`
- 生命周期、组件实例、渲染更新：先看 `runtime-core`
- DOM 行为异常：再看 `runtime-dom`
- 模板产物异常：先看 `compiler-core` / `compiler-dom`
- `.vue` 文件特有行为：先看 `compiler-sfc`

### 3.2 先找最小复现

优先从这些地方找：

- [packages/runtime-core/__tests__](https://github.com/vuejs/core/blob/main/packages/runtime-core/__tests__)
- [packages/reactivity/__tests__](https://github.com/vuejs/core/blob/main/packages/reactivity/__tests__)
- [packages/vue/__tests__](https://github.com/vuejs/core/blob/main/packages/vue/__tests__)

优点：

- 复现稳定
- 干扰少
- 改动后回归验证成本低

### 3.3 再决定断点路线

不要一开始到处下断点。先围绕一条链路打点。

例如：

- 看“为什么更新了”：从 `trigger` 开始
- 看“为什么没更新”：从 `shouldUpdateComponent`、`queueJob` 开始
- 看“为什么模板编译成这样”：从 `compile`、`transform`、`codegen` 开始

## 4. 运行时调试路线

下面是调试组件创建、挂载、更新、销毁时最常用的断点路线。

### 4.1 组件创建与挂载

建议断点顺序：

1. `mountComponent`
2. `createComponentInstance`
3. `setupComponent`
4. `setupStatefulComponent`
5. `handleSetupResult`
6. `finishComponentSetup`
7. `setupRenderEffect`
8. `renderComponentRoot`
9. `patch`

关键文件：

- [packages/runtime-core/src/renderer.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts)
- [packages/runtime-core/src/component.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/component.ts)
- [packages/runtime-core/src/componentRenderUtils.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentRenderUtils.ts)

### 4.2 组件更新

建议断点顺序：

1. `trigger`
2. `ReactiveEffect.trigger`
3. `queueJob`
4. `instance.update`
5. `updateComponentPreRender`
6. `renderComponentRoot`
7. `patch`

关键文件：

- [packages/reactivity/src/dep.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/dep.ts)
- [packages/reactivity/src/effect.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/effect.ts)
- [packages/runtime-core/src/scheduler.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/scheduler.ts)
- [packages/runtime-core/src/renderer.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts)

### 4.3 组件销毁

建议重点观察：

- `beforeUnmount` / `unmounted`
- 组件 `scope` 清理
- 子树递归卸载
- refs 和 DOM 解绑

关键文件：

- [packages/runtime-core/src/renderer.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts)
- [packages/runtime-core/src/component.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/component.ts)

## 5. 响应式调试路线

如果你在查的是“值为什么变了”或“为什么没有触发更新”，最重要的不是组件，而是响应式依赖图。

建议断点顺序：

1. `reactive`
2. `ref`
3. `track`
4. `trigger`
5. `ReactiveEffect.run`
6. `watch`
7. `computed`

关键文件：

- [packages/reactivity/src/reactive.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/reactive.ts)
- [packages/reactivity/src/ref.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/ref.ts)
- [packages/reactivity/src/dep.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/dep.ts)
- [packages/reactivity/src/effect.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/effect.ts)
- [packages/reactivity/src/watch.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/watch.ts)
- [packages/reactivity/src/computed.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/computed.ts)

推荐关注的问题：

- 当前 key 是在哪次读取时被 `track` 的
- 更新时是哪次写入触发了 `trigger`
- 对应 effect 是同步执行还是被 scheduler 入队

## 6. 编译器调试路线

如果模板结果不符合预期，优先不要从运行时开始查，而是先看编译结果。

推荐入口：

```bash
pnpm dev-compiler
```

建议断点顺序：

1. `compile`
2. `baseParse`
3. `transform`
4. 各个 transform 插件
5. `generate`

关键文件：

- [packages/compiler-core/src/compile.ts](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/compile.ts)
- [packages/compiler-core/src/parser.ts](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/parser.ts)
- [packages/compiler-core/src/transform.ts](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transform.ts)
- [packages/compiler-core/src/codegen.ts](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/codegen.ts)

适合观察：

- 生成的 AST 是否正确
- transform 后节点是否被正确改写
- patch flags 是否符合预期
- 最终 render code 是否和运行时假设一致

## 7. SFC 调试路线

当问题只会出现在 `.vue` 文件里，而不是手写 render 或纯模板时，优先走 `dev-sfc`。

命令：

```bash
pnpm dev-sfc
```

推荐关注：

- `<script setup>` 变量暴露
- `defineProps` / `defineEmits`
- 模板与 script 的绑定关系
- scoped style / CSS vars

关键目录：

- [packages/compiler-sfc](https://github.com/vuejs/core/blob/main/packages/compiler-sfc)
- [packages-private/sfc-playground](https://github.com/vuejs/core/blob/main/packages-private/sfc-playground)

## 8. 最常用断点文件清单

如果你只想先配一批高价值断点，优先看这些文件：

- [packages/runtime-core/src/component.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/component.ts)
- [packages/runtime-core/src/renderer.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/renderer.ts)
- [packages/runtime-core/src/componentRenderUtils.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/componentRenderUtils.ts)
- [packages/runtime-core/src/scheduler.ts](https://github.com/vuejs/core/blob/main/packages/runtime-core/src/scheduler.ts)
- [packages/reactivity/src/effect.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/effect.ts)
- [packages/reactivity/src/dep.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/dep.ts)
- [packages/reactivity/src/reactive.ts](https://github.com/vuejs/core/blob/main/packages/reactivity/src/reactive.ts)
- [packages/compiler-core/src/parser.ts](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/parser.ts)
- [packages/compiler-core/src/transform.ts](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/transform.ts)
- [packages/compiler-core/src/codegen.ts](https://github.com/vuejs/core/blob/main/packages/compiler-core/src/codegen.ts)

## 9. 常用命令速查

### 9.1 安装依赖

```bash
pnpm i
```

### 9.2 监听开发构建

```bash
pnpm dev
```

### 9.3 调试 SFC Playground

```bash
pnpm dev-sfc
```

### 9.4 调试模板编译器

```bash
pnpm dev-compiler
```

### 9.5 跑所有测试

```bash
pnpm test
```

### 9.6 跑某个包相关测试

```bash
pnpm test runtime-core
pnpm test reactive
```

### 9.7 跑某个测试名

```bash
pnpm test watch -t "should trigger"
```

### 9.8 类型检查

```bash
pnpm check
```

## 10. 调试建议

### 10.1 先调测试，不要先调大项目

对于框架源码，测试文件通常是最好的调试入口。原因是：

- 用例最小
- 输入稳定
- 噪音少
- 修改后能立刻回归验证

### 10.2 先确定“错在编译期还是运行期”

如果不先分层，很容易在错误的地方花太多时间。

经验判断：

- render code 看起来就不对：先查编译器
- render code 对，但 DOM 不对：先查运行时
- render code 对，组件根本不更新：先查响应式和 scheduler

### 10.3 优先追一条主链，不要同时看十个文件

推荐做法：

- 选一个具体现象
- 选一条调用链
- 只在关键节点断点
- 把变量变化记下来

### 10.4 先验证假设，再改代码

在 Vue Core 这类框架仓库里，误判问题层级很常见。建议每次先回答两个问题：

1. 这个函数有没有真的被调用？
2. 这个分支有没有真的走进去？

## 11. 典型问题与入口建议

### 11.1 “组件为什么没有更新？”

先看：

- `trigger`
- `queueJob`
- `shouldUpdateComponent`
- `renderComponentRoot`

### 11.2 “`watch` 为什么没触发？”

先看：

- `watch.ts`
- `dep.ts`
- `effect.ts`

### 11.3 “模板为什么编译成这样？”

先看：

- Template Explorer
- `parser.ts`
- `transform.ts`
- `codegen.ts`

### 11.4 “`.vue` 文件里 `<script setup>` 行为不对”

先看：

- `pnpm dev-sfc`
- `compiler-sfc`

## 12. 建议的学习顺序

如果你想借调试顺便把 Vue Core 读懂，建议按这个顺序：

1. `reactivity`
2. `runtime-core`
3. `runtime-dom`
4. `compiler-core`
5. `compiler-dom`
6. `compiler-sfc`

原因是：

- 响应式是更新机制的基础
- 运行时是组件系统的骨架
- DOM 适配层相对更具体
- 编译器放在后面更容易把 render code 和运行时串起来

## 13. 结语

调试 Vue Core 最有效的方法，不是一次性理解整个框架，而是：

- 先分类问题
- 选对入口
- 追一条调用链
- 用测试或 playground 固定复现

如果后续需要，可以在本文档基础上继续补充：

- VS Code `launch.json` 示例
- `runtime-core` 断点路线图
- 生命周期和源码函数对照表
- 响应式依赖流转图
