# CityQuest AI (Web HTML MVP)

## 1. 运行方式
推荐使用本地静态服务器运行：

1. 进入目录 `D:\travel`
2. 启动任一静态服务：
   - `npx serve .`
   - `python -m http.server 8080`
3. 浏览器打开终端输出地址，例如 `http://localhost:8080`

也可以直接打开 `index.html`，但摄像头、`fetch` 等能力在部分浏览器里可能受限。

## 2. 当前运行入口
- 页面入口：`index.html`
- 样式入口：`styles.css`
- 页面视图：`app-web-pages.js`
- 静态配置：`app-web-storyconfig.js`
- 剧本生成：`app-web-storygen.js`
- 主运行时：`app-web-storygame.js`

## 3. 已实现能力
- 欢迎页与首页/社区/剧本/我的四个主页面
- AI 剧本生成与官方剧本开局
- 地图点位推进与剧情分支
- 对话、到达判定、拍照打卡、结果页、结局页
- 管理员素材上传与本地持久化

## 4. 关键文件
```text
.
├─ index.html
├─ styles.css
├─ app-web-pages.js
├─ app-web-storyconfig.js
├─ app-web-storygen.js
└─ app-web-storygame.js
```
