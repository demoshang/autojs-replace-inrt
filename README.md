# Auto.js apk build

## 原理

1. fork [hyb1996/Auto.js](https://github.com/hyb1996/Auto.js) 修改成 [demoshang/Auto.js](https://github.com/demoshang/Auto.js)
2. 利用 [`inrt`](https://github.com/demoshang/Auto.js/tree/master/inrt) 项目, 替换 [`assets`](https://github.com/demoshang/Auto.js/blob/master/inrt/src/main/assets) 实现 `apk` 构建

## 使用

### 修改`project.json`符合以下说明

```js
{
  // app 的名字
  "name": "xxx",
  // 包的名字, 符合android规定
  "packageName": "com.autojs.demo.xxx",
  // app 的 logo, 必须是 png 图片
  "logo": "xxx.png",
  // app 启动页面图片, 必须是 png 图片
  "splash": "xxx.png",
  // 入口文件必须是 main.js
  "main": "main.js",
  // 版本号
  "versionName": "0.1.0",
  // 版本号的数字表示
  "versionCode": 700,
  "ignore": []
}
```

### 构建

```bash
# npm 构建
npx @s4p/autojs-replace-inrt "Auto.js项目目录" "js代码目录"

# dev 构建
npm start -- "Auto.js项目目录" "js代码目录"
```
