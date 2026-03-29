# CityQuest Web 功能说明文档

> 目标：让阅读者在看不到源码的情况下，仍然可以按本文描述复刻出当前 Web 版本的完整功能与交互。
> 本文描述对象是当前实际运行版本：`index.html + styles.css + app-web-pages.js + app-web-storyconfig.js + app-web-storygen.js + app-web-storygame.js`。

## 1. 产品概述

这是一个基于“北京中轴线”叙事主题的单页文游应用。

用户从欢迎页进入后，可以：

- 直接使用官方剧本开始游玩
- 输入关键词生成一条 AI 风格路线再开始游玩
- 在每个地标完成三段式剧情推进
- 通过“到达判定”后拍照打卡
- 查看结果页并继续推进到下一站
- 在全路线结束后进入结局页
- 在管理员页替换活动素材

它不是传统多页面网站，也不是地图导航产品，而是“地图入口 + 对话推进 + 打卡留证 + 结局收束”的叙事型 Web 应用。

## 2. 技术形态

必须按以下形态复刻，才算与当前版本一致：

- 纯静态前端项目
- 原生 HTML、CSS、JavaScript
- 无 React/Vue/小程序框架运行时
- 无打包器、无模块编译、无 npm 构建依赖
- 所有脚本通过 `script src` 直接加载

浏览器依赖能力：

- `localStorage`
- `document.cookie`
- `fetch`
- `FileReader`
- `canvas`
- `navigator.mediaDevices.getUserMedia`

建议通过本地静态服务器运行，而不是直接双击 HTML，因为摄像头、`fetch` 和本地资源读取在部分浏览器环境下会受限。

## 3. 运行入口与加载顺序

页面入口：

- `index.html`

样式入口：

- `styles.css`

脚本必须按以下顺序加载：

1. `app-web-pages.js`
2. `app-web-storyconfig.js`
3. `app-web-storygen.js`
4. `app-web-storygame.js`

职责划分：

- `app-web-pages.js`：页面级渲染工厂，负责首页/社区/剧本库/我的/管理员列表等视图渲染
- `app-web-storyconfig.js`：所有静态内容配置、地标配置、素材路径、剧情模板、结局数据
- `app-web-storygen.js`：本地“AI 剧本生成器”，本质是随机路线与模板改写器
- `app-web-storygame.js`：主运行时，负责初始化、事件、状态、剧情推进、相机、结果、结局、持久化

如果加载顺序改变，会直接导致主运行时找不到它依赖的全局对象。

## 4. 初始化流程

页面加载后，主运行时会立即执行初始化。正确顺序如下：

1. 从 `localStorage` 读取当前官方剧本 ID
2. 探测默认素材文件是否存在，并生成默认素材对象
3. 从 `localStorage` 读取管理员覆盖过的素材
4. 从 cookie 恢复剧情路线和站点进度
5. 绑定所有页面与弹层交互事件
6. 根据当前可视区计算 CSS 视口变量
7. 把当前 tab 设为首页
8. 执行全量渲染

初始化完成后的默认可见状态：

- 首页 tab 已就位
- 欢迎页 overlay 默认显示
- 其他业务 overlay 默认隐藏

## 5. 必须具备的文件与素材

最小可运行文件集如下：

```text
index.html
styles.css
app-web-pages.js
app-web-storyconfig.js
app-web-storygen.js
app-web-storygame.js
AlimamaFangYuanTiVF-Thin-2.ttf
FZZhangMLBKSJW.TTF
素材/启动页.png
素材/主地图.png
素材/每个地区的背景图/*.png
素材/打卡/*.png
素材/npc/*.png
assets/persona_frame.png
assets/coupon_qr.png
assets/frame.b64
assets/coupon.b64
```

素材兜底规则：

- 角色边框优先读 `assets/frame.b64`，没有则退回 `assets/persona_frame.png`
- 优惠券优先读 `assets/coupon.b64`，没有则退回 `assets/coupon_qr.png`
- 结果页背景会尝试按候选文件名自动探测
- 结局页背景会尝试按候选文件名自动探测
- 启动页、主地图、聊天背景、打卡背景缺失时，界面会明显失真，不会自动补全

## 6. 页面与弹层结构

### 6.1 常驻页面

应用主体中有 4 个常驻页面 section：

- 首页 `page-home`
- 社区 `page-community`
- 剧本库 `page-scripts`
- 我的 `page-profile`

底部是固定 tabbar，四个按钮分别切换以上四个页面。

### 6.2 业务弹层

整个业务流程依赖以下 overlay：

- 欢迎页 `overlay-welcome`
- 剧本构建页 `overlay-script-builder`
- AI 剧本预览页 `overlay-script-plan`
- 角色介绍页 `overlay-script-intro`
- 对话推进页 `overlay-chat`
- 相机打卡页 `overlay-camera`
- 结果页 `overlay-result`
- 结局页 `overlay-ending`
- 通用提示页 `overlay-dialog`
- 管理员素材页 `overlay-admin`

这套产品并不通过 URL 跳转驱动，而是通过 overlay 显隐驱动完整流程。

## 7. DOM 契约

当前版本大量通过 `document.getElementById()` 直接获取节点，因此以下 DOM ID 在复刻时应视为强契约：

- `page-home`
- `page-community`
- `page-scripts`
- `page-profile`
- `home-map`
- `home-script-text`
- `community-feed`
- `script-list`
- `profile-script-text`
- `startup-hero-image`
- `builder-script-list`
- `script-plan-title`
- `script-plan-summary`
- `script-plan-opening`
- `script-plan-route`
- `script-intro-role-name`
- `script-intro-portrait`
- `script-intro-name`
- `script-intro-subtitle`
- `script-intro-role-bio`
- `script-intro-summary`
- `script-intro-points`
- `script-intro-opening`
- `chat-scene-bg`
- `chat-character-avatar`
- `chat-character-name`
- `chat-character-role`
- `chat-dialogue-text`
- `route-impact`
- `story-grid`
- `chat-messages`
- `chat-choices`
- `btn-check-arrival`
- `btn-go-camera`
- `camera-video`
- `camera-frame`
- `camera-tip`
- `input-photo-file`
- `result-image`
- `result-coupon`
- `result-bg`
- `ending-bg`
- `ending-title`
- `ending-summary`
- `ending-epilogue`
- `ending-stats`
- `admin-assets`
- `compose-canvas`

如果换实现方式也可以，但这些功能位必须一一对应存在。

## 8. 全局状态设计

应用只有一个全局状态对象。

顶层状态：

- `activeTab`：当前 tab，取值为 `home/community/scripts/profile`
- `selectedScriptId`：当前官方剧本 ID
- `designAssets`：当前生效的素材配置
- `mediaStream`：摄像头流对象

会话状态 `session`：

- `nextLandmarkId`：下一站地标 ID
- `routePlan`：AI 剧本路线数组
- `generatedScript`：当前已开始的 AI 剧本对象
- `pendingScriptPlan`：已生成但尚未开始的 AI 剧本对象
- `landmarkId`：当前正在游玩的站点 ID
- `scriptIntroSeen`：当前进入流程中是否已经显示过角色介绍层
- `history`：聊天历史数组，元素结构为 `{ role, content }`
- `story`：当前站点剧情状态机对象
- `checkInPassed`：是否已通过到达判定
- `composedImage`：相机或上传图合成后的结果图
- `completed`：已完成站点 ID 数组
- `introducedRoleKeys`：已显示过角色介绍的唯一键数组
- `choiceStats`：三种倾向累计值 `{ order, insight, resolve }`
- `finalEnding`：最终结局对象

## 9. 配置数据内容

`app-web-storyconfig.js` 负责提供全部静态配置，至少需要以下数据块：

- 官方剧本列表 `SCRIPTS`
- 地标列表 `LANDMARKS`
- 社区假数据 `FEED`
- 本地存储键名 `STORAGE_KEYS`
- cookie 键名 `COOKIE_KEYS`
- 默认素材对象 `DEFAULT_ASSETS`
- base64 素材来源 `ASSET_SOURCES`
- 结果页背景候选列表
- 结局页背景候选列表
- 启动页默认图与按 tab 切换的背景图
- 每个地标的聊天背景图
- 每个地标的打卡背景图
- 首页主地图原始尺寸与点位配置 `HOME_MAP_CONFIG`
- NPC 立绘配置 `NPC_ASSETS`
- 每个站点的剧情模板 `SCENE_TEMPLATES`
- 每个站点的主线节拍文案 `MAINLINE_BEATS`
- 角色别名 `ROLE_ALIAS_BY_LANDMARK`
- 人物小传 `ROLE_BIO_BY_LANDMARK`
- 每个站点两个选项的反馈文案
- 每个选项对应的风格类型
- 风格反馈文案
- 结局库 `ENDING_LIBRARY`
- 官方剧本分支图 `ROUTE_BRANCH_GRAPH`

## 10. 首页地图功能

首页不是地图 SDK，而是一张静态地图图像加一组透明热点按钮。

主地图原始基准尺寸：

- 宽 `390`
- 高 `844`

点位数据每项至少包含：

- `name`
- `x`
- `y`
- `w`
- `h`

点位渲染方法：

1. 用地图容器实际尺寸与原始尺寸计算缩放比例
2. 创建一个与缩放后尺寸一致的内部 stage
3. stage 背景图使用主地图
4. 每个点位按原始坐标换算成百分比 `left/top`
5. 用透明按钮覆盖点位区域作为点击热点

关键行为：

- 官方剧本模式下，地图显示热点
- AI 剧本模式下，地图只显示底图，不显示可点击热点
- 用户在官方剧本模式点击任意点位时，不是跳去点击的点，而是打开“当前应前往站点”的聊天

也就是说，地图更像“进入剧情的入口层”，不是自由探索地图。

## 11. 欢迎页进入机制

欢迎页是首屏全屏层，包含：

- 启动页大图
- 顶部返回按钮占位
- 中部红色竖牌视觉主体
- 底部 startup tabbar

当前版本有一个隐藏约束：

- 代码尝试绑定 `btn-enter-app`
- 但 DOM 中并没有这个按钮
- 真正生效的是“欢迎页中部竖牌区域热点命中逻辑”

命中方式：

- 监听欢迎页容器点击
- 把点击位置转成容器内的 `xRatio / yRatio`
- 当 `xRatio` 约在 `0.42 ~ 0.58` 且 `yRatio` 约在 `0.20 ~ 0.74` 时，视为点中竖牌

命中后行为：

1. 关闭欢迎页
2. 如果当前 tab 是首页，则自动打开剧本构建页

这是复刻时最容易忽视的行为。

## 12. 官方剧本系统

当前官方剧本只有一个：

- `中轴遗章·十二阙`

每个官方剧本至少包含：

- `id`
- `name`
- `subtitle`
- `summary`
- `opening`
- `style`

官方路线的推进不是固定顺序，而是由每站第一次关键选择决定下一站。

## 13. AI 剧本生成系统

所谓 AI 剧本并不调用真实模型，而是本地规则生成。

生成逻辑：

1. 读取用户输入文本，空输入不生成剧本
2. 以中文标点、空白等方式分词
3. 最多取前 8 个 token
4. 用关键词命中预置主题、情绪词与关键物件
5. 先根据关键词与主题画像决定一条更合适的路线模板，再按锚点裁成 4 到 7 站
6. 复用现有 `SCENE_TEMPLATES`，但会继续生成每站的动态线索、选项、选择反馈、路线说明、标题、目标、开场、桥接与 beat 文案

生成结果对象包含：

- `id`
- `name`
- `subtitle`
- `summary`
- `opening`
- `promptText`
- `routePlan`
- `routeNotes`
- `sceneTemplates`
- `beats`
- `meta`

AI 剧本一旦开始，后续路线完全按 `routePlan` 顺序推进，不再受站内选项影响。

## 14. 剧本构建页流程

剧本构建页提供两种开局方式。

### 14.1 官方剧本开局

流程：

1. 渲染官方剧本列表
2. 用户点击某个剧本，设置为当前选中剧本
3. 点击“使用所选剧本开始”
4. 系统重置当前 session
5. 关闭欢迎页与剧本构建页
6. 切换到首页 tab
7. 打开第一站聊天

### 14.2 AI 剧本开局

流程：

1. 输入关键词或风格词
2. 点击“生成剧本”
3. 本地生成 `pendingScriptPlan`
4. 关闭剧本构建页并打开 AI 剧本预览页
5. 预览页展示剧本标题、摘要、开场白和路线列表
6. 用户点击“开始文游”
7. 系统把该剧本写入 `generatedScript` 和 `routePlan`
8. 清空旧剧情 cookie
9. 从 `routePlan[0]` 对应站点开始

## 15. 单站剧情结构

每个站点都会被构造成固定三段式剧情。

### 第 1 段：`n1`

含义：现场判断。

特征：

- 说话者是当前地标 NPC 身份
- 有两个互斥选项
- 选中任一选项后会获得一条 clue tag
- 自动进入 `n2`

### 第 2 段：`n2`

含义：提交本站报告。

特征：

- 说话者固定为“司牒官”
- 只有一个“上呈站牒”选项
- 选中后获得 `${地标名}报告已提交` 这个 tag
- 自动进入 `n3`

### 第 3 段：`n3`

含义：解锁到达判定。

特征：

- 只有一个选项
- 该选项要求已获得“报告已提交”tag
- 选中后执行 `unlockArrival`
- 不再自动跳下一节点

节点字段至少应有：

- `id`
- `row`
- `col`
- `speaker`
- `text`
- `choices`

## 16. 选项、副作用与锁定规则

当前版本仅实现两种 effect：

- `tag`：往 `story.tags` 写入一个字符串
- `unlockArrival`：把 `story.canCheckArrival` 设为 `true`

选项锁定规则：

- 若某个选项存在 `requirements`
- 则只有当 `story.tags` 包含所有要求项时才允许点击
- 不满足时按钮禁用，并显示“需线索：xxx”提示

## 17. 进入站点时的系统行为

每次进入某一站时，系统按以下顺序执行：

1. 记录当前 `landmarkId`
2. 清空聊天历史
3. 重置 `checkInPassed`
4. 读取当前剧本对象
5. 根据地标构建三段式剧情状态机
6. 尝试从 cookie 恢复该站点的节点进度
7. 写入剧本开场白
8. 写入“当前是第几站”提示
9. 如果是首次遇到该角色，则写入角色引导文案
10. 写入站点卷章标题
11. 写入主线节拍文案
12. 如果站点有存档，则提示已恢复进度
13. 写入当前节点的第一句对白
14. 立即持久化一次站点进度
15. 打开聊天层
16. 若本次还没显示角色介绍层，则再打开角色介绍层

## 18. 角色介绍层机制

角色介绍层只在首次进入某个“剧本 + 地标”组合时弹出。

判重方式：

- 使用 `${scriptId}:${landmark.id}` 作为唯一键
- 已展示过的键写入 `introducedRoleKeys`

介绍层展示内容：

- 角色别名 + 站点身份
- 角色立绘
- 当前剧本名
- 剧本副标题 + 当前站名
- 人物小传
- 剧本摘要
- 当前站任务
- 当前两个选项分别可能导向哪一站
- 启程告示

按钮“开始”只负责关闭介绍层，不推进剧情。

## 19. 聊天层表现方式

聊天层采用视觉小说式布局，包含：

- 当前场景背景图
- 顶部返回按钮
- 当前追缉进度
- NPC 立绘
- NPC 名称与站点身份
- 一块对白卡片
- 下方剧情选项区域
- 底部两个行动按钮：到达判定、拍照打卡

聊天内容来源包括：

- 剧本 opening
- 每站主线节拍 `MAINLINE_BEATS`
- 当前节点正文
- 选项反馈文案
- 风格反馈文案
- 恢复进度提示文案

当前对白区默认显示“最近一条 assistant 消息”的正文。

## 20. 站内推进与路线决定

玩家点击剧情选项后，系统会：

1. 找到当前节点的对应 choice
2. 校验是否满足 requirements
3. 把玩家选择写入聊天历史
4. 执行 effect
5. 如果当前节点是 `n1`，额外执行：
- 记录 `routeChoiceId`
- 输出该站点对应选项的结果反馈
- 根据选项类型累加 `choiceStats`
- 输出该风格的反馈文案
- 提示下一站导引
6. 如果当前选项有 `next`，则自动跳到下一个节点
7. 每推进一步都写入 cookie

### 官方剧本路线规则

官方剧本依赖 `ROUTE_BRANCH_GRAPH`：

- 下一站 = `ROUTE_BRANCH_GRAPH[当前站][routeChoiceId]`

### AI 剧本路线规则

AI 剧本依赖 `routePlan`：

- 下一站 = `routePlan[completed.length]`

注意：

- 在 AI 剧本中，站内选择仍会影响文案与结局倾向统计
- 但不会影响路线顺序

## 21. 到达判定与打卡解锁

“到达判定”按钮只有在当前站剧情走到 `n3` 且触发 `unlockArrival` 后才真正有效。

点击后：

- `checkInPassed = true`
- 聊天中追加“此站可封记”的提示
- “拍照打卡”按钮从禁用切换为可用

在此之前，拍照按钮必须不可点。

## 22. 相机与图片合成

相机页必须支持三种完成方式：

- 实拍
- 上传图片
- 跳过拍照

### 22.1 实拍

流程：

1. 打开相机页时尝试调用摄像头
2. 若成功，则把视频流显示在 `video` 元素里
3. 点击“拍照并合成”时，从视频帧截取当前画面
4. 将截图送入合成函数

### 22.2 上传图片

流程：

1. 用户点击“上传图片合成”
2. 触发隐藏文件输入框
3. 读取用户选择的图片文件
4. 转成 Data URL
5. 送入合成函数

### 22.3 跳过拍照

流程：

- 不采集任何用户图像
- 直接使用当前站点的打卡背景图作为结果图
- 若打卡背景没有，则依次退到结果背景图、优惠券图

### 22.4 合成规则

合成逻辑必须是：

1. 先把照片或上传图绘制到 canvas
2. 读取当前站点打卡背景图
3. 若站点打卡图读取失败，则退回 `personaFrame`
4. 把叠加图覆盖绘制到原图上
5. 导出 png base64 结果

注意这里叠加的不只是透明边框，它优先使用“当前站打卡主题图”。

## 23. 结果页与继续推进

结果页展示内容：

- 合成后的主图
- 优惠券图
- 可选的结果页背景图

结果页按钮：

- `保存图片`
- `继续推进`

点击“继续推进”后系统要：

1. 将当前站写入 `completed`
2. 关闭结果页和相机页
3. 计算下一站
4. 把当前路线状态写入 cookie
5. 若不存在下一站，则进入结局流程
6. 若存在下一站，则立即进入下一站聊天

## 24. 结局系统

结局由三种倾向累计值决定：

- `order`：循制
- `insight`：机断
- `resolve`：决行

判定规则：

- 如果某一个值单独最高，则进入对应结局
- 如果最高值并列，则进入 `balanced`

结局页展示内容：

- 背景图
- 标题
- 摘要
- 尾声
- 三种倾向统计

结局页按钮：

- `再启新卷`：重置整段会话并重新打开剧本构建页
- `返回首页`：关闭结局页

进入结局后必须清空剧情 cookie，否则刷新后会恢复到错误进度。

## 25. 持久化设计

### 25.1 `localStorage`

只存长期配置：

- 当前选中的官方剧本 ID
- 管理员替换后的素材对象

### 25.2 `cookie`

只存剧情过程数据：

- 每个地标的节点进度
- 已获线索 tags
- 已访问节点列表
- 是否已解锁到达判定
- 当前站第一次选择的 routeChoiceId
- 是否已通过到达判定
- 当前下一站
- AI 剧本路线数组
- 已完成站点数组
- 风格统计值

为什么不能把两者合并：

- 当前版本设计就是“配置放 localStorage，进度放 cookie”
- 若想 1:1 复刻，应保留这一层语义分工

## 26. 管理员素材替换系统

管理员页允许替换 4 类素材：

- `personaFrame`
- `couponImage`
- `resultBgImage`
- `endingBgImage`

每个素材项都包含：

- 标题
- 说明文字
- 当前预览图
- 上传按钮

上传后行为：

1. 使用 `FileReader.readAsDataURL()` 读取图片
2. 把结果写入 `state.designAssets`
3. 立即写入 `localStorage`
4. 重新渲染管理员页

整个过程没有后端。

## 27. 视觉与适配要求

视觉风格必须保持“古风叙事 UI”，不是普通后台样式。

关键视觉特征：

- 首页全屏显示主地图
- 社区/剧本/我的页面都有古旧背景图与纸张质感卡片
- 欢迎页中央是红色竖牌式入口
- 剧情页为视觉小说式布局
- 角色介绍页、结局页为独立美术页

适配规则：

- 用 `--app-vh` 解决移动端视口高度变化
- 用 `--dense-scale` 对矮屏进行整体压缩
- 使用 `env(safe-area-inset-top/bottom)` 处理安全区
- 区分手机窄屏和矮屏

本地字体：

- `Alimama FangYuan`
- `FZ Zhang`

字体丢失不会影响功能，但会影响视觉还原。

## 28. 最容易复刻错的点

1. 欢迎页真实入口是“中部竖牌热区”，不是按钮元素。
2. 首页地图点击后进入的是“当前应前往站点”，不是被点击站点本身。
3. AI 剧本模式下首页地图没有点位热点。
4. 角色介绍去重是“剧本 ID + 地标 ID”，不是只按地标去重。
5. 合成图叠加优先级是“当前站打卡图 > personaFrame”，不是固定一张边框图。
6. 官方剧本和 AI 剧本共用同一套站内三段式剧情，但路线决定机制不同。
7. 配置与素材用 `localStorage`，剧情进度用 cookie，不能随意混成一种存储。
8. 结局触发后要清空剧情 cookie。

## 29. 推荐验收清单

复刻后至少验证以下场景：

1. 打开页面时首先看到欢迎页。
2. 点击欢迎页中部竖牌可进入剧本构建页。
3. 可直接开始官方剧本。
4. 可输入关键词生成 AI 剧本并预览路线。
5. 任意站点均按 `n1 -> n2 -> n3` 三段式推进。
6. 到达判定前，拍照按钮不可点。
7. 到达判定后，拍照按钮解锁。
8. 摄像头不可用时仍可上传图片或跳过。
9. 结果页可以保存图片。
10. 点击继续推进后可进入下一站或结局。
11. 刷新页面后可恢复剧情进度。
12. 完成整条路线后可进入结局页。

## 30. 一句话总结

这是一套以单一全局状态为核心、以 overlay 流程串联业务、以配置数据驱动剧情、以 cookie 和 localStorage 维持恢复能力的原生静态单页文游应用。
