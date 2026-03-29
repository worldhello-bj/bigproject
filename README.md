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

## 5. 面向独立文游的剧本生成核心
如果后续目标是把“剧本生成”抽离成一个单独的体验文游，那么 `app-web-storygen.js` 应该被理解为“文游内容引擎”的雏形，而不是当前大页面里的一个附属功能。

这套生成逻辑并不调用外部模型接口，而是基于关键词、地标配置和一套模板规则，在前端本地拼装出一份可直接进入主线的剧本对象。它最大的价值，正是足够稳定、可控、可拆分，很适合作为独立文游的底层生成层。

### 5.1 入口在哪里
- 页面侧入口在 `app-web-storygame.js`
- 运行时会调用 `buildGeneratedScriptFromPrompt(promptText)`
- 实际生成器来自 `window.CityQuestStoryGen.buildGeneratedScriptFromPrompt(...)`
- 该对象由 `app-web-storygen.js` 挂到 `window` 上

也就是说，`app-web-storygame.js` 负责“触发生成并消费结果”，`app-web-storygen.js` 负责“把提示词变成剧本对象”。

### 5.2 生成器输入
`buildGeneratedScriptFromPrompt(promptText, context)` 的输入分成两部分：

- `promptText`
  用户输入的关键词，例如“悬疑”“宫廷”“夜雨追缉”“完整长篇”等。
- `context`
  运行时上下文，主要由 `app-web-storygame.js` 传入：
  - `landmarks`
    来自 `app-web-storyconfig.js` 的地标列表。
  - `sceneTemplates`
    每个地标对应的基础剧情模板。
  - `getLandmarkById`
    地标查询函数。

生成器如果拿不到地标或提示词，会直接返回 `null`。

### 5.3 总体流程
剧本生成可以理解为 5 步：

1. 把用户提示词拆成可匹配的 token
2. 根据 token 推出“主题蓝图”
3. 根据主题蓝图选择路线
4. 逐站把基础模板改写成生成版剧情
5. 返回一份完整剧本对象给运行时使用

### 5.4 第一步：提示词分词与归一化
对应函数：

- `tokenizePrompt`
- `unique`
- `includesKeyword`

处理逻辑：

- 先把输入按空格、逗号、句号、分号、问号等符号切开
- 清理掉无关字符，只保留中英文和数字
- 对长度较长的中文词再做 2 到 4 字的切片扩展
- 去重后最多保留 12 个 token

这样做的目的是提高模糊匹配能力。比如用户只输入一句较长描述，也能从里面切出“宫廷”“夜雨”“追缉”“天坛”这类可命中的子词。

### 5.5 第二步：构建主题蓝图
对应函数：

- `scoreThemeProfiles`
- `resolveThemeBlend`
- `resolveMoodWord`
- `resolvePromptObject`
- `resolveCaseTitle`
- `buildBlueprint`

这一步会从若干预设库里挑出一套“本次剧本的风格骨架”。

#### 5.5.1 主题判定
`THEME_PROFILES` 里预设了几类主题：

- `suspense`
- `intrigue`
- `pursuit`
- `ritual`
- `legend`

每个主题都有自己的：

- 关键词
- 案名词池
- 遗失物词池
- 事件模板
- 反派词池
- 风险描述
- 副标题模板
- 开场语气

生成器会先根据 token 对这些主题打分，选一个主主题；如果提示词里还能明显命中第二主题，就作为副主题；否则从 `PROFILE_COMPANIONS` 里给主主题挑一个搭配主题。

#### 5.5.2 情绪词、目标物、案名
除了主副主题，还会继续推导：

- `moodWord`
  例如夜雨、月下、风雪这类情绪词，来自 `MOOD_LIBRARY`
- `artifact`
  本卷追查的核心物件，来自 `OBJECT_HINTS` 或主题自带词池
- `title`
  剧本标题，优先尝试把提示词里比较突出的特殊词拼进标题；否则用主题词池组合
- `subtitle`
  用主副主题的副标题模板生成

#### 5.5.3 蓝图最终产物
`buildBlueprint` 最终会得到一份中间蓝图对象，大致包含：

- 主主题 `profile`
- 副主题 `secondaryProfile`
- 情绪词 `moodWord`
- 目标物 `artifact`
- 事件描述 `incidentLine`
- 反派 `villain`
- 风险 `stake`
- 暗线秘密 `secret`
- 掩护说辞 `coverStory`
- 标题 `title`
- 副标题 `subtitle`
- 开场基调 `introTone`
- 主题融合说明 `blendLine`

这个蓝图是后面所有路线和文案生成的核心输入。

### 5.6 第三步：路线选择
对应函数：

- `resolveStoryLength`
- `findAnchorIds`
- `scoreRoutePattern`
- `resolveRoutePattern`
- `fitRouteToLength`
- `pickRoutePlan`

这一步决定“这卷从哪几站开始，到哪几站结束，中间经过哪些地标”。

#### 5.6.1 先决定长度
`resolveStoryLength` 会根据提示词判断本轮想要长篇还是短篇：

- 默认长度约 5 站
- 关键词多、或者出现“长篇 / 完整 / 全轴”会加长
- 出现“短篇 / 轻量 / 快速”会缩短
- 最终长度限制在 4 到 7 站之间

#### 5.6.2 抽取用户指定锚点
`findAnchorIds` 会把提示词里提到的地标先找出来。

比如用户写了“故宫、天坛、永定门”，这些地标会作为路线锚点，后面的裁剪会尽量保留它们。

#### 5.6.3 在预设路线里选最合适的路线骨架
`ROUTE_PATTERNS` 里预设了若干路线模式，例如：

- 北段追查
- 宫城核心
- 坛庙祭仪
- 南段收束
- 全轴长卷

每条路线模式会根据以下因素打分：

- 是否匹配主主题
- 是否匹配副主题
- 是否命中路线关键词
- 是否覆盖用户提到的锚点
- 是否命中特定偏好词，例如“终局”“全轴”“宫廷”“追缉”

得分最高的模式会作为本轮路线骨架。

#### 5.6.4 按长度裁剪路线
`fitRouteToLength` 会在选中的路线骨架上做裁剪：

- 如果用户提到锚点，会优先保留锚点所在区间
- 如果没提锚点，则根据主题倾向决定更偏北段、中段还是南段
- 最终得到 `routePlan`

这个 `routePlan` 是 AI 剧本真正使用的固定路线。

### 5.7 第四步：逐站生成内容
对应函数：

- `resolveChoiceStyles`
- `buildGeneratedClues`
- `buildGeneratedOptions`
- `buildStageObjective`
- `buildStageIntro`
- `buildStageReport`
- `buildStageBridge`
- `buildChoiceResult`
- `buildRouteNote`
- `buildBeatText`
- `buildChapterTitle`

这一层是把 `app-web-storyconfig.js` 里的基础站点模板，改造成“本轮剧本专属版本”。

#### 5.7.1 为什么要复用基础模板
每个地标在 `SCENE_TEMPLATES` 里本来就有一套静态模板，里面带有：

- 标题
- 目标
- 开场介绍
- 两个选项
- 两条线索
- 汇报文案
- 解锁文案
- 过桥文案

AI 生成不是从零写全文，而是在这些静态模板之上做再加工。这样能保证：

- 每个地标仍然符合原本的世界观
- 站点结构统一
- 不容易生成出完全跑偏的剧情

#### 5.7.2 每站会生成什么
对于 `routePlan` 中的每一个地标，生成器都会产出：

- `title`
  章节标题，带上阶段标签
- `objective`
  本站目标
- `intro`
  本站改写后的开场
- `options`
  两个改写后的操作选项
- `clues`
  两条改写后的线索
- `report`
  本站上报要求
- `unlock`
  解锁文案
- `bridge`
  通往下一站的衔接文案
- `routeNote`
  路线摘要
- `choiceStyles`
  两个选项分别属于 `order / insight / resolve` 哪种风格
- `choiceResults`
  选择每个选项后，对应展示的结果文案

同时还会单独生成：

- `beats[landmarkId]`
  对应这一站的节奏说明

#### 5.7.3 选项风格有什么用
选项风格来自三类调查倾向：

- `order`
  循制、校序、稳步推进
- `insight`
  辨伪、拆解、看穿假象
- `resolve`
  决断、追击、抢主动权

`resolveChoiceStyles` 会根据主题轮换规则，为每一站的两个选项分配这三种风格中的两个。

这些风格会影响：

- 选项文案怎么修饰
- 线索后缀怎么装饰
- 选择结果如何描述
- 结局统计偏向哪种路线

需要注意的是：

- 在 AI 生成剧本模式下，选项不会改写整体路线
- 路线在生成完成时就已经固定
- 选项主要影响文案风格、站点反馈和结局倾向统计

### 5.8 第五步：输出剧本对象
最终 `buildGeneratedScriptFromPrompt` 会返回一份完整剧本对象，结构大致如下：

```js
{
  id,
  name,
  subtitle,
  summary,
  opening,
  promptText,
  routePlan,
  routeNotes,
  sceneTemplates,
  beats,
  meta
}
```

字段说明：

- `id`
  基于提示词和路线做种子生成，保证同一输入下结果相对稳定
- `name`
  AI 生成的剧本名
- `subtitle`
  AI 生成的副标题
- `summary`
  用于剧本计划页展示的总体简介
- `opening`
  开卷文案
- `promptText`
  原始提示词
- `routePlan`
  本卷固定路线
- `routeNotes`
  每站路线摘要
- `sceneTemplates`
  每站可直接进入对话系统的生成模板
- `beats`
  每站节奏文案
- `meta`
  主题、目标物、反派、路线模式等元信息

### 5.9 生成结果如何接入运行时
生成器本身只负责“产出数据”，真正消费数据的是 `app-web-storygame.js`。

接入链路如下：

1. 用户输入关键词并点击生成
2. `app-web-storygame.js` 调用生成器
3. 返回的剧本对象先进入“剧本计划页”
4. 用户确认后，结果写入 `state.session.generatedScript`
5. `routePlan` 写入当前会话
6. 后续每站聊天、选项、节奏、导语，都优先读取 `generatedScript.sceneTemplates`

对应关系大致如下：

- 计划页用 `name / summary / opening / routePlan / routeNotes`
- 聊天页用 `sceneTemplates[landmarkId]`
- 节奏提示用 `beats[landmarkId]`
- 结局倾向用 `choiceStyles` 带来的 `choiceStats`

### 5.10 设计特点
这套生成逻辑的特点不是“自由生成长文本”，而是“规则驱动的可控生成”。

优点：

- 不依赖外部接口，前端本地即可运行
- 风格稳定，不容易完全跑题
- 路线、地标、模板都能复用现有配置
- 同一提示词下结果较稳定，方便调试
- 生成结果天然兼容现有剧情运行时

限制：

- 创作自由度受限于预设词库和模板池
- 文案变化主要来自“词替换 + 句式改写”，不是大模型自由写作
- 路线必须来自预设路线模式，不能无限制自由规划

### 5.11 后续扩展建议
如果要继续增强这套生成器，优先建议从下面几个方向扩：

- 扩充 `THEME_PROFILES`
  增加更多主题词池和语气模板
- 扩充 `ROUTE_PATTERNS`
  让路线模式更丰富
- 扩充 `LANDMARK_KEYWORDS`
  提高用户提示词命中地标的概率
- 扩充 `MOOD_LIBRARY` 和 `OBJECT_HINTS`
  让标题、案由和目标物更多样
- 扩充 `STYLE_*` 相关词池
  提高每站选项与线索文案差异
- 丰富 `SCENE_TEMPLATES`
  让基础模板本身提供更强的站点特色

## 6. 如果要抽离成单独的体验文游

### 6.1 先明确：要抽离的其实不是页面，而是“内容循环”
如果把这套功能拆成独立文游，真正要保留的核心不是当前首页、社区、拍照这些页面，而是下面这条体验链路：

1. 用户输入一句关键词或题材偏好
2. 系统生成一卷可玩的故事
3. 用户进入开场
4. 按站点推进剧情
5. 每站做选择、拿线索、看反馈
6. 整卷结束后结算出结局
7. 用户重新开一卷

换句话说，独立文游版本应当围绕“生成一卷并玩完一卷”来设计，而不是围绕现在的大而全文旅 App 结构设计。

### 6.2 当前项目里，哪些部分适合保留
如果做独立文游，建议优先保留下面这些能力：

- `app-web-storygen.js`
  这是核心生成器，负责把提示词变成完整剧本对象。
- `app-web-storyconfig.js` 里的 `LANDMARKS`
  这是当前世界观里的章节节点池。
- `app-web-storyconfig.js` 里的 `SCENE_TEMPLATES`
  这是每个节点的基础剧情模板。
- `app-web-storygame.js` 里的会话推进逻辑
  例如 `routePlan`、`generatedScript`、`choiceStats`、`finalEnding` 这些状态结构，本质上已经很接近文游运行时。
- `ENDING_LIBRARY`
  已经具备基础结局系统。

这些部分拼起来，已经足够支撑一个“文字冒险 / 轻互动叙事”产品的第一版。

### 6.3 当前项目里，哪些部分适合去掉或降级
如果目标是独立文游，下面这些内容可以先去掉，或者降级成后续扩展：

- 首页地图点击和大地图展示
- 社区页、商城页、个人页
- 拍照打卡、相机、结果页合成
- 文旅素材运营后台
- 与文旅打卡场景强绑定的 UI 文案

这些功能在当前项目里是“完整文旅应用体验”的一部分，但对独立文游来说不是第一优先级。先把叙事体验跑通，比先保留这些外围能力更重要。

### 6.4 独立文游版本的推荐形态
如果只做第一版 MVP，页面甚至可以非常简单，推荐只保留 5 个界面：

1. `生成页`
   输入关键词，例如“宫廷悬疑”“夜雨追缉”“祭仪异闻”。
2. `剧本预览页`
   展示标题、副标题、开场文案、路线摘要，允许“开始这一卷”。
3. `正文页`
   展示当前章节标题、引导文、选项、线索进度。
4. `阶段反馈页`
   用户做完本站选择后，展示结果反馈，并进入下一站。
5. `结局页`
   根据累计风格给出结局与总结，允许“再开新卷”。

这一版的核心是“文本体验完整”，不是“页面种类丰富”。

### 6.5 推荐的模块拆法
如果要真拆成一个独立项目，建议按下面三个层来组织：

- `内容生成层`
  负责根据提示词生成剧本对象。
- `会话推进层`
  负责当前章节、选择结果、结局统计、下一步去哪。
- `展示层`
  只负责把当前状态渲染出来，不直接参与生成规则。

对应到当前代码，大致可以这样映射：

- `内容生成层`
  主要来自 `app-web-storygen.js`
- `会话推进层`
  主要来自 `app-web-storygame.js`
- `展示层`
  未来可以是一个更轻量的新页面，不必沿用现在的大 App 结构

### 6.6 抽离后建议保留的接口
如果想把它做成更干净的独立文游引擎，建议最终沉淀出类似下面这组接口：

```js
generateStory(promptText, context)
createSession(script)
getCurrentStage(session)
chooseStageOption(session, choiceId)
advanceStage(session)
resolveEnding(session)
restartSession()
```

其中：

- `generateStory`
  负责生成整卷内容
- `createSession`
  根据生成结果初始化游玩状态
- `getCurrentStage`
  读取当前章节
- `chooseStageOption`
  记录本章选择和风格偏好
- `advanceStage`
  前进到下一章
- `resolveEnding`
  在最后一章结束时产出结局

这样拆完之后，文游 UI 可以随便换，但底层逻辑不会跟某个页面实现绑死。

### 6.7 当前逻辑更像“线性文游”，不是强分支文游
这一点在抽离时要提前想清楚。

现在这套 AI 剧本生成逻辑里：

- 路线在生成时就已经确定
- 用户选项会影响文案风格和结局倾向
- 用户选项通常不会改变整条路线

所以它更适合被定义成：

- “线性主线 + 风格分支”的文游

而不是：

- “每个选择都改写大剧情走向”的强分支文游

如果你想先快速落地一个独立产品，我建议保留现在这套模式。因为它：

- 更稳定
- 更容易写内容
- 不容易爆炸式增加剧本复杂度

如果以后要升级成更强分支，可以再往下扩：

- 让 `routePlan` 不再固定，而是分支生成
- 每站不只产出两条风格反馈，而是产出不同后继节点
- 让 `sceneTemplates` 支持同一地标的多个剧情变体

### 6.8 从当前项目抽离的最小步骤
如果现在就准备动手拆，建议按这个顺序：

1. 先把 `app-web-storygen.js` 保持纯函数化
   不依赖 DOM，不依赖页面状态。
2. 再把 `app-web-storygame.js` 里的会话状态单独提出来
   变成“文游 Session Manager”。
3. 定义统一的剧本对象结构
   保持 `routePlan / sceneTemplates / beats / meta` 这套协议稳定。
4. 做一个全新、极简的文游页面
   只渲染生成、正文、结局三段体验。
5. 最后再决定是否把地图、插画、音效等包装层加回来。

这个顺序的好处是：先把“可玩性”拆出来，再考虑“包装感”。

### 6.9 如果做成单独项目，我建议 README 的产品定位这样写
可以把这个独立版本理解成：

- 一个基于关键词即时生成“单卷叙事”的轻文游
- 一个以章节推进、风格选择、结局收束为核心循环的互动文字体验
- 一个规则驱动、可重复游玩的故事生成器

这比“文旅 App 的一个子功能”更容易讲清楚，也更容易做产品聚焦。

## 7. 一句话总结
`app-web-storygen.js` 的本质，不只是“帮当前项目生成一条路线”，而是已经具备被抽离成独立文游内容引擎的雏形：输入关键词，输出一整卷可游玩的叙事结构。
