# ie-webpack2-seed
webpack2 compatible ie8

# 命令介绍
- npm run dev 开发模式，支持hot reload，不支持IE8下访问
- npm run dev_ie8 开发者模式，无hot reload，支持IE8下访问
- npm run build 打包

# 已知缺陷
- 无法使用webpack2的Tree Shaking优化
- 不支持 export {default as xx} from 'xxx';