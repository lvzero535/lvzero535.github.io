# Nginx重定向

## 前言

在`nginx`的配置中碰到一个奇怪的问题，在浏览器输入`http://mydomin.com/test`时会重定向到这样的路径`http://mydomin.com:8080/test/`下，完全不知道咋回来，后来网上搜索一波，原来这是`nginx` 重定向的。在`nginx`的配置中 `http://mydomin.com/test/` 和`http://mydomin.com/test` 是不一样的，前者是找`test` 目录下的`index.html或page.html`，后者会发生301重定向。而重定向的结果和三个变量的配置有关。

## nginx配置

语法:   absolute_redirect on | off;
默认值:  absolute_redirect on;
上下文:  http, server, location
这个指令出现在版本 1.11.8.

 on：响应，301 `Location: http://mydomin.com/test/` 

off：响应，301 `Location: /test/` 



语法: port_in_redirect on | off;
默认值: port_in_redirect on;
上下文: http, server, location
开启或关闭nginx发起绝对重定向（absolute_redirect on）时指定端口。

重定向中首要主机名的使用由server_name_in_redirect指令控制。

 on：响应，301 `Location: http://mydomin.com:8080/test/`  8080是nginx监听的端口

off：响应，301 `Location: http://mydomin.com/test/`  端口是浏览器访问地址自带的端口，如80或443，响应的就是80或443



语法: server_name_in_redirect on | off;
默认值: server_name_in_redirect off;
上下文: http, server, location
开启或关闭nginx将server_name指令指定的首要虚拟主机名用于发起的绝对重定向（absolute_redirect on）的功能。关闭此功能时（server_name_in_redirect off），nginx将使用“Host”请求头中的名字，如果没有此请求头，nginx将使用虚拟主机所在的IP地址。

重定向中端口的使用由port_in_redirect指令控制。



on：响应，301 `Location: http://localhost/test/`  域名是`nginx`配置的`server_name` 

off：响应，301 `Location: http://mydomin.com/test/`  

## 参考

https://www.jianshu.com/p/3adcb8b931a3

http://nginx.org/en/docs/http/ngx_http_core_module.html#absolute_redirect