# 服务端主动通信：WebSocket，SSE，HTTP2

## WebSocket

[WebSocket](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket) 是基于HTTP协议升级上来的一个新网络协议，支持：客户端 ↔ 服务端 双向通信的全双工通道。

WebSocket 主要特点

- **协议**：基于TCP的独立协议（ws/wss），和HTTP有相同的端口号（80/443），且通过HTTP协议升级而来，不存在兼容性问题。
- **数据格式**：支持文本和二进制数据传输，效率高。
- **跨域**：没有同源限制，客户端可以连接到任意服务器。
- **协议开销**：初始握手基于 HTTP，之后使用轻量级帧协议，数据头较小（2-14 字节）。

### WebSocket 连接过程

#### 1. 建立 TCP 连接

- 客户端（通常是浏览器）首先通过 TCP 三次握手 与服务器建立 TCP 连接。
- 这一步和普通 HTTP 一样。

#### 2. 发送 HTTP 请求进行协议升级（HTTP Upgrade）

- 客户端会发起一个特殊的 HTTP 请求，要求把连接从 HTTP 协议升级到 WebSocket 协议。
- 请求头大概长这样：

```http
GET /chat HTTP/1.1
Host: example.com:80
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Sec-WebSocket-Version: 13
Origin: http://example.com
```

**关键点：**

- Upgrade: websocket 表示要升级到 WebSocket。
- Connection: Upgrade 表示这是升级请求。
- Sec-WebSocket-Key 是随机生成的 base64 值，用来和服务器确认握手。
- Sec-WebSocket-Version: 13 说明客户端支持的 WebSocket 版本。
- Origin 用来检查跨域来源。

#### 3. 服务器响应（协议升级成功）

- 如果服务器支持 WebSocket，会返回 101 Switching Protocols 响应：

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=
```

**关键点：**

- 状态码 101 表示协议切换。
- Sec-WebSocket-Accept 是根据客户端 Sec-WebSocket-Key 生成的确认值（用 SHA1 + base64 算法）。
- **注意：**如果服务器不支持，可能返回 400 或 403 直接拒绝。

#### 4. 升级成功，进入 WebSocket 协议

- 一旦 HTTP 协议升级完成，连接就不再是 HTTP，而是 WebSocket 协议。
- 此时，客户端和服务器可以 全双工通信（双向，实时），不需要再发 HTTP 请求。

#### 5. 数据帧传输

- WebSocket 定义了一种 数据帧格式，支持：
  - 文本帧（Text Frame）
  - 二进制帧（Binary Frame）
  - 控制帧（Ping、Pong、Close）

#### 6. 关闭连接

任何一方可以发送 Close 帧，对方收到后关闭 TCP 连接。

#### WebSocket 连接和数据传输时序图

#### 客户端 (Browser)-------------------------服务器 (Server)
      │                                           │
      │ —— TCP 三次握手 ————————————————> │
      │                                           │
      │ GET /chat HTTP/1.1                        │
      │ Host: example.com                         │
      │ Upgrade: websocket                        │
      │ Connection: Upgrade                       │
      │ Sec-WebSocket-Key: dGhlIHNhbX...          │
      │ Sec-WebSocket-Version: 13                 │
      │ Origin: http://example.com                │
      │ ————————————————————————————————————————> │
      │                                           │
      │ <——————————————————————————————————————— │
      │ HTTP/1.1 101 Switching Protocols          │
      │ Upgrade: websocket                        │
      │ Connection: Upgrade                       │
      │ Sec-WebSocket-Accept: s3pPLMBiTxa...      │
      │                                           │
      │   (协议升级成功，切换到 WebSocket 协议)   │
      │                                           │
      │ —— WebSocket 数据帧 ————————>             │
      │  Text Frame: "Hello Server"               │
      │                                           │
      │ <———————— WebSocket 数据帧 ————————       │
      │  Text Frame: "Hello Client"               │
      │                                           │
      │ <———————— WebSocket 数据帧 ————————       │
      │  Binary Frame: [01010101]                 │
      │                                           │
      │ —— WebSocket Ping 帧 ——————————>          │
      │ <———————— WebSocket Pong 帧 ————————     │
      │                                           │
      │ —— WebSocket Close 帧 ——————————>         │
      │ <———————— WebSocket Close 帧 ————————    │
      │                                           │
      │ —— TCP 连接关闭 ————————————————————>      │


### 客户端

使用浏览器的`WebSocket` API，可以很方便地创建 WebSocket 连接。

```js
const socket = new WebSocket('URL', 'protocol1');
```

WebSocket 客户端 API 主要包括以下几个部分：

**构造函数**：

- `new WebSocket(URL, [protocol])`，创建一个新的 WebSocket 对象。
- URL：连接的目标服务器地址，支持ws/wss、http/https协议, 且不得包含 URL 片段。如果提供的是相对 URL，则其相对于调用脚本的基础 URL。
- protocol：一个协议字符串或者一个包含协议字符串的数组。这些字符串用于指定子协议，这样单个服务器可以实现多个 WebSocket 子协议（例如，你可能希望一台服务器能够根据指定的协议（protocol）处理不同类型的交互）。如果不指定协议字符串，则假定为空字符串。

**属性**：

- `readyState`
  - `CONNECTING`：值为0，表示正在连接。
  - `OPEN`：值为1，表示连接成功，可以通信了。
  - `CLOSING`：值为2，表示连接正在关闭。
  - `CLOSED`：值为3，表示连接已经关闭，或者打开连接失败。
- `bufferedAmount`: 是一个只读属性，用于返回已经被send()方法放入队列中但还没有被发送到网络中的数据的字节数。一旦队列中的所有数据被发送至网络，则该属性值将被重置为 0。但是，若在发送过程中连接被关闭，则属性值不会重置为 0。如果你不断地调用send()，则该属性值会持续增长
- `url`
- `protocol`
- `binaryType`： 实例对象的binaryType属性，用于指定收到的二进制数据的类型，默认值为`blob`。

**事件**

- `open`： 实例对象的onopen属性，用于指定连接成功后的回调函数。

```js
socket.onopen = function (event) {
  console.log('连接成功');
};

// 如果要指定多个回调函数，可以使用addEventListener方法。
socket.addEventListener('open', function (event) {
  socket.send('Hello Server!');
});

```

- `message`： 实例对象的onmessage属性，用于指定收到服务器数据后的回调函数。
  - **注意**，服务器数据可能是文本，也可能是二进制数据（`blob`对象或`Arraybuffer`对象）。

```js
socket.onmessage = function(event){
  if(typeof event.data === String) {
    console.log("Received data string");
  }

  if(event.data instanceof ArrayBuffer){
    var buffer = event.data;
    console.log("Received arraybuffer");
  }
}

```

- `error`: 实例对象的onerror属性，用于指定报错时的回调函数。  
- `close`: 实例对象的onclose属性，用于指定连接关闭后的回调函数。

**实例方法**：

- `send(data)`: 实例对象的send()方法用于向服务器发送数据。

```js
// 发送文本的例子。
socket.send('your message');

// 发送 Blob 对象的例子。
var file = document
  .querySelector('input[type="file"]')
  .files[0];
socket.send(file);

// 发送 ArrayBuffer 对象的例子。
// Sending canvas ImageData as ArrayBuffer
var img = canvas_context.getImageData(0, 0, 400, 320);
var binary = new Uint8Array(img.data.length);
for (var i = 0; i < img.data.length; i++) {
  binary[i] = img.data[i];
}
socket.send(binary.buffer);


```

- `close()`: 实例对象的close()方法用于关闭连接。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>WebSocket 测试</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    #log { border: 1px solid #ccc; padding: 10px; height: 200px; overflow-y: auto; }
    input { padding: 5px; margin-right: 10px; }
    button { padding: 5px 10px; }
  </style>
</head>
<body>
  <h2>WebSocket 客户端测试</h2>
  <div id="log"></div>
  <br />
  <input id="msg" type="text" placeholder="输入要发送的消息" />
  <button id="sendBtn">发送</button>

  <script>
    const logBox = document.getElementById('log');
    const msgInput = document.getElementById('msg');
    const sendBtn = document.getElementById('sendBtn');

    // 连接 Node WebSocket 服务端
    const ws = new WebSocket('ws://localhost:8080');

    function log(message) {
      const p = document.createElement('p');
      p.textContent = message;
      logBox.appendChild(p);
      logBox.scrollTop = logBox.scrollHeight;
    }

    ws.onopen = () => {
      log('✅ 已连接到 WebSocket 服务端');
    };

    ws.onmessage = (event) => {
      log('📩 收到: ' + event.data);
    };

    ws.onclose = () => {
      log('❌ 连接已关闭');
    };

    ws.onerror = (err) => {
      log('⚠️ 出错: ' + err);
    };

    sendBtn.addEventListener('click', () => {
      const msg = msgInput.value;
      if (msg && ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
        log('➡️ 发送: ' + msg);
        msgInput.value = '';
      }
    });
  </script>
</body>
</html>

```

### 服务端

服务端的websocket要自己起服务，对于nodejs来说，有很多模块可以使用：

- Socket.IO
- ws

使用`Node.js`的`ws`模块，可以很方便地创建 WebSocket 服务端。

```js
// server.js
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', function connection(ws) {
  console.log('客户端已连接');

  ws.on('message', function incoming(message) {
    console.log('收到消息:', message.toString());
    ws.send(`你刚才发的是: ${message}`);
  });

  ws.on('close', () => {
    console.log('客户端断开连接');
  });
});

console.log('✅ WebSocket 服务器已启动 ws://localhost:8080');
```

## SSE

[Server-Sent Events](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events/Using_server-sent_events)，是基于HTTP的由服务器主动推送给浏览器的数据流。

相比于[WebSocket](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket) SSE，有自己有的优点：

- SSE 使用HTTP协议，不存在兼容性问题。WebSocket是一个独立协议。
- SSE 属于轻量级，使用简单；WebSocket协议相对复杂。
- SSE 默认支持断线重连，WebSocket 需要自己实现。
- SSE 只用来传送文本，二进制数据需要编码后传送；WebSocket默认支持二进制数据。
- SSE 支持自定义发送的消息类型。

### 客户端

使用浏览器的API`EventSource`，传入一个`URL`，即可连接到SSE服务端。
可以跨域，如果`URL`不同源，可以在第二个参数中传入是否携带`cookie`。

```js
const evtSource = new EventSource("//URL", {
  withCredentials: true,
});
```

**实例属性**

- evtSource.readyState: 一个代表连接状态的数字。可能值是 CONNECTING（0）、OPEN（1）或 CLOSED（2）。
- evtSource.withCredentials: 一个布尔值，表示 EventSource 对象是否使用跨源资源共享（CORS）凭据来实例化（true），或者不使用（false，即默认值）。

**实例方法**

- evtSource.close()：关闭连接（如果有），并将 readyState 属性设置为 CLOSED。如果连接已经关闭，则该方法不执行任何操作。

**事件**

- error：在事件源连接未能打开时触发。
- message：在从事件源接收到数据时触发。
- open：在与事件源的连接打开时触发。

**自定义事件**

默认情况，服务器发送过来的数据触发的事件总是`message`。开发者可以自己事件，但是需要和后端协商。

**客户端示例**

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>SSE 客户端示例</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 20px; }
    #log { border: 1px solid #ccc; padding: 10px; height: 200px; overflow-y: auto; }
  </style>
</head>
<body>
  <h2>Server-Sent Events 测试</h2>
  <div id="log"></div>

  <script>
    const logBox = document.getElementById('log');

    function log(message) {
      const p = document.createElement('p');
      p.textContent = message;
      logBox.appendChild(p);
      logBox.scrollTop = logBox.scrollHeight;
    }

    // 连接 SSE
    const evtSource = new EventSource('http://localhost:3000/events');

    evtSource.onopen = () => {
      log('✅ 已连接到 SSE 服务端');
    };

    evtSource.onmessage = (event) => {
      log('📩 收到消息: ' + event.data);
    };

    evtSource.onerror = (err) => {
      log('⚠️ 出错: ' + JSON.stringify(err));
    };
  </script>
</body>
</html>

```

### 服务端

服务器接收到请求时，返回的`SSE`数据必需是`UTF-8`编码的文本。
且请求头中的`Content-Type`必须指定`MIME`类型为`event-stream`。

```text
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

每一次发消息，由若干个message组成，每个message之前用`\n\n`分隔。每个内部由若干行组成，每一行都如下格式：
`[field]: value\n`

**上面的field可以取四个值：**

- event：用于标识事件类型的字符串。如果指定了这个字符串，浏览器会将具有指定事件名称的事件分派给相应的监听器；网站源代码应该使用 addEventListener() 来监听指定的事件。如果一个消息没有指定事件名称，那么 onmessage 处理程序就会被调用。
- data：消息的数据字段。当 EventSource 接收到多个以 data: 开头的连续行时，会将它们连接起来，在它们之间插入一个换行符。末尾的换行符会被删除。
- id：事件 ID。这会成为当前 EventSource 对象的内部属性“最后一个事件 ID”的属性值。
- retry：重新连接的时间。如果与服务器的连接丢失，浏览器将等待指定的时间，然后尝试重新连接。这必须是一个整数，以毫秒为单位指定重新连接的时间。如果指定了一个非整数值，该字段将被忽略。

**服务端示例**

```js
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;

// 允许跨域
app.use(cors());

// SSE 路由
app.get('/events', (req, res) => {
  // 设置响应头，保持连接
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // 每隔 2 秒推送一条消息
  let counter = 0;
  const intervalId = setInterval(() => {
    counter++;
    const data = `data: 这是服务端推送的第 ${counter} 条消息\n\n`;
    res.write(data);
  }, 2000);

  // 客户端断开连接时，清理定时器
  req.on('close', () => {
    clearInterval(intervalId);
    console.log('❌ 客户端断开连接');
  });
});

app.listen(PORT, () => {
  console.log(`🚀 SSE 服务运行在 http://localhost:${PORT}`);
});

```

## WebSocket & SSE

### 工作原理

**WebSocket**

- 基于 HTTP 握手，升级协议到 ws:// 或 wss://。
- 建立后是 全双工通道：客户端 ↔ 服务端 双向通信。
- 传输是 二进制帧/文本帧，效率高。

**SSE**

- 基于 HTTP 长连接。
- 浏览器原生支持 EventSource 对象。
- 单向通道：服务端 → 客户端 推送数据。
- 本质是一个不断刷新的 HTTP 流（text/event-stream）。

### 优缺点对比

| 特点           | **WebSocket**            | **SSE (Server-Sent Events)** |
| ------------ | ------------------------ | ---------------------------- |
| **连接类型**     | 全双工（双向通信）                | 单向（服务端 → 客户端）                |
| **协议**       | 独立于 HTTP 的 WebSocket 协议  | 标准 HTTP 协议                   |
| **数据格式**     | 文本、二进制都支持                | 仅文本（UTF-8）                   |
| **浏览器支持**    | 广泛支持                     | 大多数现代浏览器支持，但 IE 不支持          |
| **断线重连**     | 需要手动实现心跳和重连              | 内置自动重连（EventSource 自带）       |
| **跨域支持**     | 依赖服务端设置 CORS + Origin 校验 | 依赖 CORS，配置简单                 |
| **复杂度**      | 需要专门的 WebSocket 服务端实现    | 使用现有 HTTP 服务即可               |
| **传输效率**     | 高效（小消息头、二进制支持）           | 较低（基于 HTTP 文本流）              |
| **代理/防火墙支持** | 部分老旧代理不支持 WebSocket      | 基于 HTTP，兼容性更好                |

## HTTP2推送

服务器推送是h2里的一项功能，但需要开发者自己配置，开启后，服务端可以在收到请求后，主动推送资源到客户端，而不需要客户端再发请求。

**注意：**

- 这种推送是基于http2的，所以只能在http2协议下使用。
- 推送的静态资源由可能浏览器已缓存， 重复推送导致带宽的浪费， 需要判断是否已加载，给已推送的内容添加cookie，存在就不再推送。

**一般不推送动态资源**

- 内容过时：
  - 动态资源（如 API 数据）可能因用户状态、时间戳或请求参数变化而失效。
  - 推送过早的动态数据可能不匹配客户端需求，导致缓存浪费。

- 复杂逻辑：
  - 服务器需预测客户端需要的动态资源（如基于 URL 参数或用户认证）。
  - 例如，在你的小信云平台项目中，设备状态 API（如 /api/devices）可能因设备 ID 动态变化，难以准确推送。

- 缓存管理：
  - Push Cache 生命周期短（与 HTTP/2 连接相关），动态资源可能快速失效。
  - 客户端可能已通过其他方式（如 fetch）请求相同资源，导致重复。

- 性能开销：
  - 生成动态资源（如数据库查询）增加服务器负载，相比静态资源推送成本更高。
  - 推送过多动态资源可能干扰主请求，增加首屏时间。

- 跨域问题：
  - 动态资源（如 API）推送需正确设置 Access-Control-Allow-Origin（你的字体跨域问题类似）。
  - 示例：推送 /api/data 需 CORS 头支持。

**nginx 开启 http2 推送需要在配置文件中添加如下内容：**

```nginx
server {
    listen 443 http2;
    server_name example.com;

    # 其他配置...

    # 开启 http2 推送
    location / {
      root   /usr/share/nginx/html;
      index  index.html index.htm;
      http2_push /style.css; # 推送 css 文件
      http2_push /example.png; # 推送 png 文件
    }
}
```

## 参考

- [WebSocket-MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/WebSocket)
- [WebSocket-知乎-智践行](https://zhuanlan.zhihu.com/p/1937928964212494803)
- [WebSocket-ruanyifeng](http://ruanyifeng.com/blog/2017/05/websocket.html)
- [Server-Sent Events 教程-ruanyifeng](https://www.ruanyifeng.com/blog/2017/05/server-sent_events.html)
- [Server-Sent Events -MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/Server-sent_events/Using_server-sent_events)
- [HTTP/2 服务器推送（Server Push）教程-ruanyifeng](https://www.ruanyifeng.com/blog/2018/03/http2_server_push.html)
