# CSS中BFC的详解

## 什么是BFC

> BFC(Block Formatting Context) 格式化上下文，是Web页面中盒模型布局的CSS渲染模式，指一个独立的渲染区域或者说是一个隔离的独立容器。

## 形成BFC的条件

> 1. 浮动元素，**`float`**除**`none`** 以外的值
> 2. 定位元素，**`position(absolue,fixed)`** 
> 3. `display` 为以下其中之一的值 `inline-block,table-cell,table-caption` 
> 4. `overflow`除了visible以外的值`(hidden,auto,scroll)`

## BFC特性

> 1. 内部的Box会在垂直方向上一个接一个的放置。
>
>    BFC内部的Box在垂直方向上一个接一个的放置，即是由上到下的顺序摆放。且是左对齐。
>
> 2. 垂直方向上的距离由margin决定。
>
>    在正常文档流中，两个兄弟盒子之间的距离（外边距margin）不是相加的距离，而是有最大margin的决定。
>
> 3. bfc的区域不会与float的元素区域重叠。
>
>    当前两个盒子有一个是float，有一个是BFC区域的，两个盒子会并排在一个，而不是float在bfc的上面。
>
> 4. 计算bfc的高度时，浮动元素也参与计算。
>
> 5. bfc就是页面上的一个独立容器，容器里面的子元素不会影响外面元素。
>
>
>
**转载:** https://www.cnblogs.com/chen-cong/p/7862832.html