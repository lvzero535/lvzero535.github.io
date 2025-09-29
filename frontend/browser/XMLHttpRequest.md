# XMLHttpRequest

## 简述

`XMLHttpRequest` 对象不用刷新浏览器就可以直接和服务器交互，获取数据，加载内容等操作。相当于局部刷新内容，`ajax`就是基于此对象开发的。

## 实践

`new XMLHttpRequest()` 返回一个对象，里面有各种属性和方法，还有事件监听器。在`IE5, IE6`下有兼容性，可以`new ActiveXObject("Microsoft.XMLHTTP")` 替换。

- 实例化对象，有兼容性就处理。
- 初始化请求`open(method, url, [async=true])` ，第三个参数默认为`true`异步请求。
- 发送数据`send()` 如果`method`为`get,header`时可以为空，要设置请求头时在这之前设置。
- 监听`onreadystatechange`事件，当`readyState`变化时会触发该事件，可以在回调里判断请求是否成功`readyState == 4` 或 `xhr.status == 200` 都表示请求成功。
- 最后就是处理请求返回的数据了`xhr.responseText`。

```javascript 
function ajax() {
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if(window.ActiveXObject) {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xhr.open(method, url, async = true);
    xhr.setRequestHeader('auth', 'token');
    xhr.send();
    xhr.onreadystatechange = function() {
        if(xhr.readyState === 4 || xhr.status === 200) {
            console.log(xhr.responseText);
        }
    }
}
```

## 属性或方法

### [`readyState`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/readyState)

`readyState` 代表一个请求码，不同时期有不同值，当这个值变时会触发[`onreadystatechange`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/onreadystatechange) 监听的回调函数。一共有**5** 值，如下：

| 状态 | 值               | 描述                                                         |
| ---- | ---------------- | ------------------------------------------------------------ |
| 0    | `UNSENT`         | 代理（实例化）被创建，但尚未调用`open()`方法。               |
| 1    | `OPENED`         | `open()`方法已被调用。                                       |
| 2    | HEADERS_RECEIVED | `send()`方法已被调用，并且头部和状态已经可以获得。           |
| 3    | `LOADING`        | 下载中；`responseText`属性已经包含部分数据。也就是说`onprogress` 事件在触发的过程中。 |
| 4    | `DONE`           | 下载操作完成，可以这个为准处理成功的数据                     |

### [`onreadystatechange`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/onreadystatechange)

当[`readyState`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/readyState) 属性改变时，触发该监听的回调事件

### [`responseType`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/responseType)

手动设置服务器响应数据的类型，默认为 `text` 。当设置为空字符串时也是默认`text`。

**注意**：

- 设值时和设`header`一样，在`open()`和`send()` 之间才可以。
- 设置的类型和服务器响应的数据类型不兼容时，返回的数据变成`null`。比如说：响应数据是`text/html`时，设置为`json` 时获取到的就是`null`

| 值            | 描述                                                         |
| ------------- | ------------------------------------------------------------ |
| “ ” 或 `text` | 默认类型（[`DOMString`](https://developer.mozilla.org/zh-CN/docs/Web/API/DOMString)） |
| `arraybuffer` | `response`是一个二进制数据 `ArrayBuffer`                     |
| `blob`        | `response` 是一个二进制数据 `Blob`                           |
| `document`    | response是一个`HTML Document`或`XML XMLDocument`，取决于接收到的数据的`MIME`类型 |
| `json`        | response是一个`JavaScript`对象。这个对象是通过`JSON`解析得到的 |



### [`response`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/response) 

服务器响应的数据类型，类型可以是`ArrayBuffer`、`Blob`、`Document`、`JavaScript Object`、`DOMString`默认值，取决于[`responseType`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/responseType) 属性。

### [`responseText`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/responseText)

只能在`responseType`　属性为`text`时获取服务器响应的值，`responseType`是其他值时会报错。

请求未发出或未成功时为`null`。

### [`responseURL`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/responseURL)

返回响应的序列化（serialized）URL，如果该 URL 为空，则返回空字符串。

### [`status`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/status)

`HTTP`状态码

### [`statusText`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/statusText)

和`status` 状态码对应的状态本文

### [`timeout`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/timeout)

设置请求最大的超时时间（毫秒），若超出该时间时，请求会自动结束。

### `ontimeout`

当请求超时会触发监听事件。

### [`upload`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/upload)

代表上传代表的对象。可以绑定事件追踪上传进度。事件和`XMLHttpRequest`一样

### [`withCredentials`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/withCredentials)

布尔值，默认为`false` 。当跨域请求时，`cookies`，`authorization headers`头部受权或`TLS`客户端证书，服务器无法获取上述内容，因为浏览器忽略这些不会和请求一起发送到后端的，只有设置为`true` 时才会发送给服务器。

### 方法

- `abort`如果请求已发送，立即中止请求。
- `getAllResponseHeaders` 以字符串形式返回所有用`CRLF`分隔的响应头，没响应是`null`。
- `getResponseHeader(headerName)` 返回指定响应头的字符串，未响应或不存在则是`null` 。
- `open(method, url, [async=true])` 初始化一个请求。
- `setRequestHeader(headerName, headerValue)` 在`open`之后`send`之前才有效
- `send(data)` 发送请求数据。
- `overrideMimeType` 重写由服务器返回的`mime`类型

## 事件

请求过程中会有一系列事件监听。

> 可以用`on + type`，也可以用`addEventListener`监听事件。

| 事件                                                         | 描述                                                         |
| ------------------------------------------------------------ | ------------------------------------------------------------ |
| [`abort`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/abort_event) | 当`request`请求停止时触发，如调用`abort`方法会触发           |
| [`error`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/error_event) | 当`request`遭遇错误时触发                                    |
| [`load`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/load_event) | 当`request`请求***成功***时触发                              |
| `loadend`                                                    | 请求结束时触发，无论成功（`load`）还是失败（`error`）触发    |
| `loadstart`                                                  | 请求收到响应数据时触发（数据还没完全响应，和`progress` 同一时期触发） |
| `progress`                                                   | 请求接收到数据开始周期触发                                   |
| [`timeout`](https://developer.mozilla.org/zh-CN/docs/Web/API/XMLHttpRequest/timeout_event) | 在预设时间内没收到响应时触发                                 |

