# Path

## path.resolve

通过碎片化路径转化成标准路径，序列化后从右到左处理，
每个后续片段前置，直到拼接成绝对路径，如果左边还有没处理的，则忽略。
path.resolve('/foo/bar', './baz');  -->'/foo/bar/baz'
path.resolve('/foo/bar', '/tmp/file/'); -->'/tmp/file/'
path.resolve('wwwroot', 'static_files/png/', '../gif/image.gif');
如果当前工作目录是 /home/myself/node，
则返回 '/home/myself/node/wwwroot/static_files/gif/image.gif'

## path.join

通过平台特定分隔符把所有路径片段连接在一起，然后规范化生成路径
