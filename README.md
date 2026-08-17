# RedisVisual · 看得见的 Redis

一个面向零基础学习者的可视化教学应用：把 Redis 讲成看得见的慢动作。
从「你已经会的东西」出发，40 分钟讲透 **Redis 是什么、为什么快、我们的系统
（WeShipItNow）为什么用它**，最后带你亲手写一遍、过一遍面试高频题。

## 七站学习闭环

1. **`/` 什么是 Redis** — 八幕小动画：字典 → SET/GET → 仓库 vs 工作台 →
   内存有多快 → 命令路径短 + 单线程 → 五种数据结构 → 加速层 → 一句话公式。
2. **`/data` 数据结构详解** — 五种核心结构（String/List/Hash/Set/Sorted Set）+ 专用类型
   （Bitmap/HLL/Geo/Stream）+ 底层编码，每种配动画、命令、用途、面试深挖。
3. **`/scenarios` 我们为什么用它** — 回到 WeShipItNow，用动画讲透 Redis 的三处用法：
   运费报价缓存（cache-aside）、买标签幂等（SET NX）、余额投影（balance projection）。
4. **`/pitfalls` 缓存的坑与一致性** — 缓存穿透 / 击穿 / 雪崩 + 数据库-缓存双写一致性
   （延迟双删）+ 热点 key / 大 key。
5. **`/internals` 生产机制** — 持久化（RDB/AOF）/ 过期与内存淘汰 / 高可用（主从·哨兵·集群）
   / 事务（MULTI·WATCH·Lua·pipeline·分布式锁）。
6. **`/code` 跟着写一遍** — 手把手：打开 VS Code → Docker 起 Redis → 初始化
   Node/TypeScript 项目 → 写代码 → 运行 → 用 redis-cli 观察。逐行点亮 + 终端回放。
7. **`/interview` 面试速通** — 26 道高频面试题（分类可展开）+ 总结，帮你能用英语跟面试官聊。

## 运行

本机默认 Node 是 16，跑不动 Next 15，先切到 Node 22（已提供 `.nvmrc`）：

```bash
nvm use          # 切到 Node 22
npm install
npm run dev      # 打开 http://localhost:3000
```

构建验证（含类型检查）：`npm run build`。

## 结构

- Next.js 15 (App Router) + TypeScript + React 19，纯 CSS（无 Tailwind，刻意减少依赖）。
- 每一站是「数据文件 + 页面文件 + 专属 CSS」一组：
  - `lib/intro.ts` ↔ `app/page.tsx` ↔ `app/home.css`
  - `lib/datalab.ts` ↔ `app/data/page.tsx` ↔ `app/data/data.css`
  - `lib/scenarios.ts` ↔ `app/scenarios/page.tsx` ↔ `app/scenarios/scenarios.css`
  - `lib/pitfalls.ts` ↔ `app/pitfalls/page.tsx` ↔ `app/pitfalls/pitfalls.css`
  - `lib/internals.ts` ↔ `app/internals/page.tsx` ↔ `app/internals/internals.css`
  - `lib/codelab.ts` ↔ `app/code/page.tsx` ↔ `app/code/code.css`
  - `lib/interview.ts` ↔ `app/interview/page.tsx` ↔ `app/interview/interview.css`
- 外壳「Research OS」：侧栏 `app/sidebar.tsx`、工具条 `app/toolbar.tsx`、命令面板
  `app/command-palette.tsx`（⌘K）、主题/UI 状态 `app/theme-provider.tsx`。
- 中英双语 `lib/i18n.tsx`（所有文案 `{ zh, en }` 成对）；术语词典 `lib/glossary.tsx`
  （正文里 `[[key:显示文字]]` 可点击弹出解释）。
- 主题 token + 通用组件样式在 `app/globals.css`；各站专属动画在各自的 CSS 里。
