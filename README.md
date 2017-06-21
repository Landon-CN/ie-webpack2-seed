# JTalk
- 京东金融JTalk前端项目
- 要求兼容IE7

# 使用说明
- `npm run start` 开发环境
- `npm run test` 预览环境
- `npm run build` 上线打包 dist目录
- `npm run clean` 清除所有生成文件

# 技术栈
- gulp
- es6+less
- jquery@1.12.4 兼容IE7
- es5-shim es5-sham
- 文本框采用 contenteditable属性自己实现 兼容性>=ie6可以满足需求,其他富文本框架基本不兼容到IE8
    - 问题1：表情无法插入到光标处，有标准处理，但是IE8,IE7兼容性问题需要继续调研
- 图片上传 jquery-file-upload(blueimp-file-upload)，兼容性>=-ie6+ Mozilla Firefox 3.0+
- 模板渲染 mustache.js 后续可以转化为nodejs渲染
- 表情库 采用和京东在线客户一样的表情库，已download所有图片
- 图片粘贴 onPaste事件监听
    - 问题1： 兼容性 IE>11(未证实)


# 目录结构
- src
    - index.js 入口文件
    - index.html
    - index.less
    - components 模块位置，模块化开发，尽量将代码分散到模块里面解耦
    - imgs 图片位置，所有图片都放这里，暂时无依赖分析，只能丢一起了
- lib 各种库所在位置
- dev 开发编译目录，无压缩，带sourcemap
- test test编译目录，有压缩，带sourcemap
- dist 上线编译目录，压缩，无sourcemap

# 开发环境
- gulp+babel+browsersync

# dev环境密码
- huiasd123
- 123
