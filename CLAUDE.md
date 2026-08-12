# CLAUDE.md — RedisVisual

Redis 教学应用的项目背景。新会话请先读完这份文件再动手。

## 这是什么

**RedisVisual（看得见的 Redis）**：面向零基础学习者的可视化教学网站，把 Redis
讲成看得见的慢动作。目标是让完全不懂 Redis 的人，40 分钟后能知道 Redis 是什么、
为什么快、为什么用，并且能在面试里跟人聊。项目主人有一段 WeShipItNow 的全栈实习经历，
简历里写了用 Redis，这个应用既是学习工具，也是为面试防守那段经历做准备。

风格与工程形态整体移植自姊妹项目 AgentLab（`../AgentLab`）：代码简单可读优先于
工程完备，解释要多，别过度抽象。

## 四站学习闭环

1. **`/` 什么是 Redis** ✅ — 八幕 CSS 动画（字典 → SET/GET → 仓库vs工作台 →
   内存延迟阶梯 → 命令路径+单线程 → 五种数据结构 → 加速层 → 公式）。
   数据 `lib/intro.ts`，页面 `app/page.tsx`，样式 `app/home.css`。
2. **`/scenarios` 我们为什么用它** — WeShipItNow 三场景动画：rate cache（cache-aside）、
   idempotency（SET NX）、balance projection。数据 `lib/scenarios.ts`，页面
   `app/scenarios/page.tsx`，样式 `app/scenarios/scenarios.css`。
3. **`/code` 跟着写一遍** — VS Code 手把手：Docker 起 Redis → npm 初始化 → 写
   `src/index.ts`（三段 demo）→ 运行 → redis-cli 观察。逐行点亮 + 终端回放。
   数据 `lib/codelab.ts`，页面 `app/code/page.tsx`，样式 `app/code/code.css`。
4. **`/interview` 面试速通** — 分类可展开的高频面试题 + 总结卡。数据
   `lib/interview.ts`，页面 `app/interview/page.tsx`，样式 `app/interview/interview.css`。

## 关键设计决策

- **每一站 = 数据文件 + 页面文件 + 专属 CSS**。新增/修改站点沿用这个模式，并在
  `app/sidebar.tsx` 的 `STOPS` 里登记（侧栏/面包屑/命令面板都从这份清单取数据）。
- **文案分层**：只有外壳（侧栏/工具条/命令面板/四站导航名）的通用文案放在
  `lib/i18n.tsx` 的 `ui`；各站正文都写在各自的数据文件里，互不干扰、便于并行开发。
  所有文案都是 `{ zh, en }` 成对（类型 `L`），新增文案两种语言都要写。
- **术语词典**：正文里写 `[[key:显示文字]]`，`RichText`（`lib/glossary.tsx`）渲染成
  可点击弹层。未知 key 自动降级为纯文本，绝不报错。
- **样式分层**：主题 token（Redis 品牌红为主强调色）+ 通用组件类在 `app/globals.css`；
  各站专属动画放各自 CSS，类名带前缀（`hm-`/`sc2-`/`cl3-`/`iv4-`）避免冲突。
  颜色一律用 CSS 变量，深/浅主题自动适配（`[data-theme]`，深色默认，无闪脚本在
  `<head>` 里首帧前设好）。
- **内容诚实原则**（贯穿 scenarios / interview 两站）：这是为真实面试准备的，凡是
  项目里没真正做过的用法（如只做了 rate cache 就别把 idempotency 也说成做过）、
  没测过的数字（简历那个 40%），都要提醒“别过度包装”。

## 技术栈与环境

- Next.js 15 (App Router) + TypeScript + React 19，纯 CSS（无 Tailwind）。
- **本机默认 Node 是 16，跑不动 Next 15**。已提供 `.nvmrc`（Node 22），任何 npm
  命令前先 `nvm use`，或用绝对路径 `~/.nvm/versions/node/v22.21.1/bin`。
- `npm run dev` 默认 3000 端口；构建验证 `npm run build`（含类型检查）。

## 文案风格（重要，全站贯穿）

**基调：教科书 / 技术文档式的清晰陈述。通俗 ≠ 口语化。**
面向零基础讲得明白是目标，但语气必须专业、正式、简洁。

- **禁止**：网络用语与流行梗（「翻车」「离谱」「一把梭」「说白了」「香」「完全体」
  「正确姿势」「甩锅」「手一抖」「玩完了」「没毛病」「血赚」「天花板」）、
  游戏／动漫／饭圈用语（「大招」「名场面」「官配」「装备栏」「段位」）、
  卖萌语气词（「啦」「呀」「嘛」「~」）、插科打诨式自问自答（「你猜怎么着」
  「好问题」「其实吧」）、拿读者开玩笑（「你会哭」「用户怕是要报警」）；
- **同样禁止** AI 腔：「值得注意的是」「综上所述」「让我们深入探讨」「赋能」；
- **保留并鼓励**：面向零基础的通俗解释、恰当的生活类比（一摞盘子讲栈、
  编号储物柜讲数组、餐厅点菜讲 API）—— 类比本身是好东西，问题只出在表达轻佻。
  比喻要讲得平实；
- 感叹号克制使用。正文强调靠加粗和措辞，不靠标点；
- 卡片标题、章节标题不加装饰性 emoji；符号只用 ✓ ✕ → ★ 这类功能性记号；
- 代码注释同样适用以上规则，不要用第一人称拟人（「我比栈顶暖」）；
- 术语第一次出现时中文 + 英文双写（如「哈希表（hash table）」），之后可只用惯用形；
- 句子可以短，但必须完整、准确。

