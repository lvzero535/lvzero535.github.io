# Angular 2+ 自定义指令

## 自定义属性指令

> 属性指令是改元素的外观、属性、行为的指令，可以指定多个属性指令。

### 宿主元素：指令所在的元素就是宿主元素。

```html
<p appHighlight></p> //p元素就是宿主元素
<app-hero appHighlight></app-hero> //app-hero 也是宿主元素

<p appHighlight="blue" defaultColor="red" [class.bg]="isBg"> 
    this paragraph is displayed because appHighlight is set to false.
</p>
```

```typescript
import { Directive, HostListener, HostBinding, Input, ElementRef } from '@angular/core';

@Directive({
    selector: '[appHighlight]'
})
export class AppHighLightDirective {

    @Input('appHighlight') highColor = 'yellow';
    @Input() defaultColor
    @HostBinding('class.bg') is:boolean;
    constructor(private el: ElementRef) {}

    @HostListener('mouseenter') onMouseEnter () {
        this.highlight(this.highColor);
        this.is = true;
    }

    @HostListener('mouseleave') onMouseLeave () {
        this.highlight(this.defaultColor);
        this.is = false;
    }

    private highlight(color: string) {
        this.el.nativeElement.style.color = color;
    }
}
```

`selector` 属性选择器，和CSS的选择器类似，但要加上方括号，而组件的选择器不需要方括号。

`构造函数`  注入的 `ElementRef` 代表的是宿主元素，由highlight函数也可以看的 出。但是它的属性`nativeElement` 才真的是可以操作的原生DOM元素。

`输入属性`  这个和模板语法差不多，一个指令有可能需要外部的数据再做出具体的动作。如上指令，外部给出指定的颜色。根据鼠标移进移出显示不同的外部指定的颜色。

- 当只有一个输入属性时，可以和指令选择器一样，直接在给指令赋值。但是指令名不能很好的反映该数据时，可以给它一个别名 `@Input('appHighlight') highColor = 'yellow';` 圆括号内的是属性别名。

- 有多个输入属性时，可以直接在宿主元素里加上该属性名并赋值，然后在指令内部再接收，记得加上`@input` 修饰符。

- 这里有一个点是，属性加上方括号时，右边是表达式，不加是字符串。

  ```html
  <p [appHighlight]="color='blue'" defaultColor="red" [class.bg]="isBg"> 
      this paragraph is displayed because appHighlight is set to false.
  </p>
  ```

`@HostBinding` 是属性装饰器，用来动态设置宿主元素的属性值。

`@HostListener` 是属性装饰器，用来为宿主元素添加事件监听。

## 自定义结构指令

> 改元素结构的指令，在物理上添加删除指令所在的元素。

```typescript
import { Directive, TemplateRef, ViewContainerRef, Input } from '@angular/core';

@Directive({
    selector: '[appUnless]'
})
export class UnlessDirective {

    private hasView = false;
    constructor(private templateRef: TemplateRef<any>,
                private viewContainerRef: ViewContainerRef) {
                 }
    @Input() set appUnless(condition: boolean) {
        if (!condition && !this.hasView) {
            this.viewContainerRef.createEmbeddedView(this.templateRef);
            this.hasView = true;
        } else if (condition && this.hasView) {
            this.viewContainerRef.clear();
            this.hasView = false;
        }
    } 
}
```

```html
<button type="button" (click)="onClick()" class="btn btn-info">Click</button>
<p *appUnless="condition" class="unless a">
  (A) This paragraph is displayed because the condition is false.
</p>

<p *appUnless="!condition" class="unless b">
  (B) Although the condition is true,
  this paragraph is displayed because appUnless is set to false.
</p>
```

> 结构指令在元素上使用都要加 *****  这上语法糖。如 `*appUnless`  该指令构造函数上有两属性注入。
>
> - `TemplateRef ` 该类是一个模板，当前使用结构形指令时，会在当前位置创建一个`<ng-template>` 并把宿主元素包括所有子元素都包裹其中。对于`<ng-template>` 元素 Angular不会主动插入到DOM树中。所以在视图上并看不到该模板内容。
> - `ViewContainerRef` 是一个视图容器，可以把`<ng-template>`  模板视图插入其中，这操作需要指令来做。可以插入一个或多个模板内容。插入后在视图上就可以看到该模板内容。
