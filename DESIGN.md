# dsh-plugin-workbench 设计记录（恢复版）

> 本文件的原始版本约 2791 行，记录了 P0–P5、§9.1–§9.28 的全部实现与取舍，于
> 2026-10-21 00:00 前后丢失（原因见 §0）。这里只重建了仍然可核对、且运维上必须
> 保留的部分：事故本身、0.2.1-rc.2 的 Typert 清单修复、运行环境与复验命令、欠账
> 清单。历史叙述无法凭记忆复原 —— 需要哪一段，就重新按当前代码写一遍，不要伪造。

## §0 事故：卸载插件时删掉了插件仓库的一部分

**现象**：从 desktop profile 卸载 `dsh-plugin-workbench`（profile 里它是
`link:D:/Workbase/dsh-plugins/dsh-plugin-workbench` 的 junction）之后，插件仓库
根目录按字母序丢了一段文件：

- 丢掉：`.gitignore`、`DESIGN.md`（本文件原版）、`HANDOFF.md`、`cordis.patch.yml`，
  以及 `node_modules` 内的 `.bin/`、`.modules.yaml`；
- 保留：`package.json`、`pnpm-lock.yaml`、`pnpm-workspace.yaml`、`tsconfig.*`、
  `tsdown.*`、以及 `packages/`、`prototype/`、`repro/` 三个目录。

删除顺序与字母序完全一致（`.gitignore` → `DESIGN.md` → `HANDOFF.md` → `README*`
→ `cordis.patch.yml` → `node_modules` → …），中止在 `node_modules` 里，而不是
跳过 junction。结论：**某个 profile 删除/重建路径用的是「递归遍历 + 跟随 reparse
point」的实现**，于是把 junction 当成了目录本身，进到仓库里删。profile 目录本身
随后重建，看起来一切正常。

**已恢复**：`cordis.patch.yml`（内容照原样重写）、`node_modules`（`pnpm install`
重建，并把 `zod` 从 `^4.4.3` 改成精确 `4.4.3`，理由见 §9.29.4）。

**未恢复**：`DESIGN.md` 原版正文、`.gitignore`。回收站与卷影副本里都没有
（Node 的 `fs.rm` 不经过回收站），D: 也没有任何卷影快照。

**后续风险**：只要插件以 `link:` 方式装在 profile 里，任何「删 profile 目录」的
操作都可能再次穿到仓库。卸载/重装前先把这个仓库复制一份，或者改用
`file:` 安装（pnpm 会复制而不是链接）。

## §7.5 运行环境与复验命令

| 项 | 值 |
| --- | --- |
| 评测机型 / 应用 | `…\win-unpacked\DeepSeek Harness.exe`（dsh 0.2.1-rc.2，Electron 44.7.0 / Node 24.21.0） |
| Node | `C:\Users\Yangtao\.dsh\dsh-runtimes\dsh-primary-runtime\dependencies\node\bin\node.exe` |
| pnpm | `…\dependencies\pnpm\bin\pnpm.mjs`（工作区 11.7.0 / 应用内置 11.28.5） |
| CLI | `…\win-unpacked\resources\runtime\cli\bin\dsh.cmd` |
| 注册表 | `https://registry.npmmirror.com` |
| 构建 + 测试 | `pnpm test` → 当前 **139 tests / 28 suites**，全绿 |

约定：

- 所有文件必须是 LF。检查：`[IO.File]::ReadAllBytes($f) -contains 13` 必须为
  `False`。
- `packages/workbench/lib` 是构建产物，不要手改；测试断言直接读它，所以改源码后
  必须先构建再测。它**入库**：安装消费的就是它，而对 git 托管的包 pnpm 默认禁止
  执行构建脚本（除非把精确 tarball URL 加进 profile 的 allowBuilds），所以仓库自带
  产物、安装零构建。改源码必须 `pnpm build` 后一起提交，否则新安装拿到旧产物。
- CSS Module 类名带 `SWF62W_` 前缀，测试按这个前缀取样式。
- 改动生效方式：客户端改动刷新页面即可；Host 改动、`package.json`、
  `cordis.patch.yml` 改动必须重启 DSH。
- 本机沙箱下 `pnpm build` / `pnpm test` 需要「完全权限」才能跑：`packages/workbench/lib`
  及其子文件在默认工作区沙箱里写入被拒（`EPERM`，目录级 WRITE_DAC 已用
  `diagnose-windows-sandbox-acl` 补齐，子文件仍因完整性标记不同而被拒）。
- 隔离验证：另建一个 `wbcheck` profile，把插件 `link:` 进去，用
  `dsh --profile wbcheck --port 0 --no-open` 起一个 headless 实例。desktop
  profile 不能被 CLI 读取或启动（会被 Electron 独占拒绝），所以 Host 侧的验证
  只能在这种模板 profile 上做。

## §9.29 0.2.1-rc.2 冷启动崩溃：Typert 清单的 `model` 层

### 9.29.1 现象

插件装好、热装状态下工作正常；**重启 DSH 后**主进程在
`openInitialWindow` 里报 `Error: desktop welcome: Web RPC failed`（`phase:
running`），窗口起不来。渲染进程没有任何错误输出 —— 失败在 Host 侧启动阶段，页面
根本没加载。卸载插件后恢复正常启动。

### 9.29.2 根因

`dsh-typert-loader` 在启动时校验插件导出的 TYPERT 清单。0.2.1-rc.2 把三个模型数组
挪进了 `model` 里：

```js
const model = requireObject(pkgName, manifest.model, 'TYPERT.model')
const services = requireArray(pkgName, model.services, 'TYPERT.model.services')
const events = requireArray(pkgName, model.events, 'TYPERT.model.events')
const objects = requireArray(pkgName, model.objects, 'TYPERT.model.objects')
```

`src/typert.host.ts` 是**手写**的清单（上游生成器分析不了 monorepo 外的插件，见
§13.8），当时按旧形状写在顶层：

```
{ package, face: 'host', schemas: [], invocations: [], services: [...], events: [], objects: [] }
```

于是启动时抛出 `typert-loader: dsh-plugin-workbench TYPERT.model must be an object`，
整个 boot 中止（`1 entry did not activate` + 未捕获异常），desktop 主进程的欢迎
RPC 随之失败。热装时之所以看不出来，是因为那次是**在已启动的 Host 上装载**，走的
不是冷启动校验路径。

### 9.29.3 修复

`src/typert.host.ts`：三个数组移入 `model`，并给 service 补上 loader 第一个读取
的 `tags: []`（`services[].key` / `exportName` / `members` / `types` 不变）。
`lib/types/typert.host.js` 与 `lib/typert.host.js` 由构建重新生成。

`packages/workbench/tests/remote-contract.spec.ts` 增加断言：
`TYPERT.model` 必须是对象，`model.services/events/objects` 必须是数组，顶层不得再
出现这三个键，service 必须带 `tags` 数组。它跑在构建产物上，所以既是形状检查也是
构建一致性检查。

### 9.29.4 顺带修的：`zod` 双份

清空 `node_modules` 重装后，根依赖 `zod: ^4.4.3` 解析成 4.6.5，而 dsh 的包锁的是
4.4.3，两份 zod 的类型在 `prepare` 阶段互不兼容（`$ZodType` 的 `_zod.version.minor`
6 vs 4），构建直接失败。改成精确 `"zod": "4.4.3"` 后整棵树只剩一份。

### 9.29.5 复验

- `pnpm test`：113 tests / 21 suites 全绿。
- `dsh plugin --profile wbcheck add <repo>` → 安装通过。
- `dsh --profile wbcheck --port 0 --no-open`：干净启动，只有
  `dsh web: http://127.0.0.1:<port>/?token=…`，没有再出现 `did not activate`。
- 修复前同一条命令 100% 复现 `TYPERT.model must be an object`。

### 9.29.6 教训

Typert 清单没有任何类型检查兜底：它由 loader 在运行时从构建产物上读，形状不对
就是**整个 Host 起不来**，而不是某个功能失效。所以改清单形状必须同时做两件事 ——
在真实 loader 上跑一次隔离 profile 启动，以及在测试里固化形状。

## §9.30 卡片改成参考图的样子

### 9.30.1 参考图

`prototype/1792676813597_d.png`（1228×402，约 2× 渲染）。原图的卡片语言：一粒带光晕
的绿色状态点、加粗标题 + 右侧绿色状态胶囊、两行灰色描述、`项目： 值` 的元信息行
（带日历图标）、底部一排**有文字的**按钮（主按钮实心绿、次按钮描边、右侧展开详情）。

参考图的色值（浅色）：卡片底 `#F4F8F5`→`#EFF6F1` 渐变，页面底 `#E4EEE6`，主按钮
`#2E9E6E`，胶囊底 `#DBF2E5` / 边 `#C2E7D5` / 字 `#1B8555`，标题 `#0A1B2E`，正文
`#58646E`。

### 9.30.2 结构

卡片现在是一条固定骨架，四个状态都走它：

1. `.mark` + `.markDot` — 20px 光晕里 9px 的实心点；已完成用绿，进行中用绿，未开始用灰。
2. `.titleRow` — `.titleText`（可点击进入编辑）+ `.statusPill`（`.statusPillDone`
   带对勾图形、`.statusPillBusy` 用品牌蓝 + 呼吸小点）+ `.archivedBadge`。
3. `.descText` — 两行 clamp，空态是斜体的“添加描述…”。
4. `.metaRow` — 日历图标 + `项目：` + 值（`.tag`，此时已不是胶囊）+ 弹簧 + 时间。
5. `.cardFoot` — `.primaryBtn`（发送）、`.ghostBtn`（总结）、`.archiveBtn`（归档，§9.31）、
   `.footSpacer`、`.cardActions > .chevron`（展开详情 / 收起详情）。没有可发送目标时主按钮
   不渲染。

折叠态仍是 `grid-template-rows: 0fr → 1fr` + `visibility` 的既有折法（§9.25）。展开区原
来缩进 29px、与标题左缘对齐，§9.31.5 改成了 `6px 0 2px`（不再缩进）。

### 9.30.3 逐条决策

- **一个绿，从主题令牌来**。`--wb-accent: var(--dsw-alias-state-success-primary)`，
  不是写死的 sage 色。状态点、胶囊、主按钮共用它，换 profile 主题时跟着变；想改回
  品牌蓝只需改这一行。
- **主按钮的绿** `--wb-accent-fill` = accent 92% + `bg-base`，落在参考图 `#2e9e6e`
  的明度上。白字对比度因此约 3.4:1 —— 与参考图本身画的一致，是刻意取舍；若要多到
  4.5:1，把混色目标从 `bg-base` 换成 `label-primary` 即可（实测会压成深墨绿）。
  深色模式下这个混色几乎不动亮绿，`--wb-on-accent`（= `bg-base`）翻成近黑，一套声
  明两种主题都成立。
- **完成卡不再变淡**。旧版完成项整张 72% 透明；参考图里完成卡是屏幕上最清楚的一张，
  “完成”由绿胶囊和绿点说。`.cardDone` 只剩更轻的投影，标题保持全强度 ——
  `field-metrics.spec.ts` 从“两种墨色要一致”改成“不许再出现变淡规则”。
- **项目行不再用胶囊**。参考图把项目当事实读：`项目： 产品官网改版`，标签和值同一
  墨色。`.tag` 因此退化成 11.5px/17px 的普通文字 + 6px 圆角 hover 底。
- **全卡只有一个字重：500**。标题、描述、项目行、时间、状态胶囊、按钮、占位符全部
  500（`.card` 上声明，子树继承）。层级改由**颜色**承担：标题用 `label-primary`，描述
  和项目值用 `--wb-body`（约 6:1），时间用 `--wb-caption`，胶囊靠底色和描边。“完成”
  的强调同理，来自绿点和绿胶囊而不是加粗。之前的 600 标题配 400 描述，读起来像两份
  文档叠在一起。
- **动作行是按钮，不是 24px 图标方块**。这是参考图的重点，也是卡片长出一行的原因。
  参考图有 4 个按钮；当时只做了 2 个，理由是归档不是用户动作（§4.7 的设想是工作区被删时
  工作项自动归档，但那条 P6 至今没实现，见 §13.8）。§9.31.4 把这个理由推翻了：归档本身
  可逆，就可以做成用户动作，Host 也补了对应的 Remote，于是动作行补上第三个按钮。
- **窄面板先牺牲文字**：`@container wb-pane (max-width: 340px)` 时收掉「展开详情」和
  「归档」的字，只留图标（`aria-label` / `title` 仍在），保住「发送」「总结」两个动词的
  标签。阈值按动作行的真实预算算出（§9.31.7）：可用宽 `面板 - 70`，三个带文字的控件要
  265。
- **命名容器是必需的，不是风格**：`.scroller` 是滚动容器，实测在 Chrome 154 里
  `@container (width <= …)` 不会拿它当容器求值；`.pane` 上加
  `container: wb-pane / inline-size` 并写 `@container wb-pane (…)` 才生效（对照实验：
  普通 div 生效，`overflow:auto` 的那个不生效）。
- **挂载点没变**：CSS Module 的 14 个 `--dsw-alias-*` 令牌 + `--dsw-specific-sidebar-fill`
  仍是全部外部输入，缺的角色（tertiary、caption、body、hover、accent 三支）继续在
  `.pane` 里本地推导（§见文件头注释）。

### 9.30.4 面板 380px 下的度量

| 元素 | 值 |
| --- | --- |
| 卡片 | padding `12 13 13`，圆角 14，`0.5px` 边框，双层投影，字重统一 500 |
| 标题 | 14px / 500 / 20px，字距 `-0.01em`，单行省略，`label-primary` 墨色 |
| 描述 | 12px / 19px，两行，上距 5px，`--wb-body` 墨色 |
| 状态胶囊 | 高 21，10.5px / 500 |
| 元信息 | 11.5px / 17px，图标 12，与描述同色；左缘回到卡片内容边（§9.31.2） |
| 动作 | 高 26，12px / 500，圆角 10；主/次按钮内距 8，展开控件 4/6（§9.31.7） |
| 展开区 | `padding: 6 0 2`，`max-height: 50cqh` |

### 9.30.5 保留的不变量

内联编辑里“输入框盒子 == 展示盒子”（横向 4px 内缩，行高一致）、单一
`--wb-jelly` 弹簧、`prefers-reduced-motion` 全覆盖（新增点、按钮、胶囊小点）、
展开区最多一条处置规则。删除按钮已整个移出面板（§9.31.4），「删除只在展开区内」这条
不变量随之作废。`field-metrics.spec.ts` / `motion.spec.ts` / `completion.spec.ts` 里对应
的断言已同步：旋转改 180°（箭头朝下即展开）、`.cardActions > button` 这条顶格规则已不
存在、写回等待态改名 `.ghostBtnPending`。

### 9.30.6 复验

`repro/card-preview.mjs` 从 `packages/workbench/lib/client.js` 里把**构建产物**的
CSS 字符串和 `{ 局部类名: 哈希类名 }` 映射撬出来，拼一张静态页（浅色/深色、
380/320/280 面板、进行中/已完成/空标签/展开态/新建卡）。`repro/serve.mjs` 用回环
http 提供它 —— Chrome 扩展不能打开 `file:`，且它会把 `127.0.0.1` 拼成
`www.127.0.0.1`，所以走 `localhost`。

```powershell
node repro/card-preview.mjs      # 写出 repro/card-preview.html
node repro/serve.mjs 47811        # http://localhost:47811/repro/card-preview.html
```

页面用的是真实类名和真实声明，所以它看到的就是插件里那张卡；它看不到的是宿主给的
令牌取值（页面用 §9.30.1 的参考色代替），以及真实侧栏的宽度。

## §9.31 卡片第二稿：左缘对齐、点阵底、归档取代删除

### 9.31.1 五条要求

用户给了两张卡的截图，逐条提了五件事：末两行（项目行、动作行）的左缘按第一张卡的布局；
卡片底色更淡、不要整张铺满，左侧可以是白色、右侧「不规则点阵晕染」；删除按钮换成归档、
放在总结之后；展开后待办总结模块 `padding: 6px 0 2px`；待办总结空状态只画一个 svg 图标，
去掉「还没有待办总结、写回后本条自动完结」两句话。

截图里两张卡的左缘不一致（第一张的项目行、动作行比第二张靠左 22px）：那是两版构建混在
一起拍的。以第一张为准 —— 它和本次要做的方向一致：末两行按卡片自己的内容边对齐。

### 9.31.2 末两行回到卡片内容边

`.metaRow` / `.cardFoot` 加 `margin-left: -26px`，把状态点那一列（20px + 6px 间隙）还给
这两行。只有标题和描述留在点列右侧：它们是被标记「属于哪一条」的正文，而项目行和动作行
是整条工作项的事实与处置，用满卡片宽度才对。

这条同时是后两条的前提：动作行多了一个按钮、展开区不再缩进，都需要宽度。

### 9.31.3 白色打底，右侧一方格晕染

`.card` 的底从「整张 4%→8% 的绿渐变」换成 `bg-base`（浅色即白），绿意改由一个
`::after` 伪元素给，并且**只有一层**：`repeating-conic-gradient` 每 8px 画一个 4px 的
半透明小正方格，再用锚在右上角的 `mask` 让它向左淡出。

- 一层是硬要求。第一稿用了「一层柔晕 + 两层点阵（7×9 与 11×13）」，两种步长互相打拍子，
  看上去像两层矩阵叠着 —— 用户一眼看出来并要求「确保一层」，于是柔晕和第二个点阵都删了，
  只剩这一个图案。
- 90° 的 conic 楔形正好是正方形（正方格的一角），所以一个 `background-image` 就能画出
  方格阵，不用两张 `linear-gradient` 拼线；颜色仍取自 `--wb-accent`（`color-mix` 到
  60% 再整体 `opacity: .22`，即每个方格约 13% 不透明），换主题跟着变。
- 格子 6px、方格 3px（§9.32.1 记的是这两轮的调整过程）。楔形的角必须正好 90° 才是正方
  形，因此方格永远是半个格子 —— 想更小只能缩格子，缩格子同时也就缩了间距。
- `mask` 的圆心放在 `102% 2%`，`76% 120%` 半径，76% 处收干净 —— 左侧约一半保持纯白，
  这就是「不要整张均匀铺满」。
- 伪元素 `z-index: -1`，`.card` 上加 `isolation: isolate`，让负层级只落在卡片自己的背景
  之上、文字之下；`border-radius: inherit` 负责裁圆角，不用 `overflow: hidden`（那会切掉
  底部按钮的焦点环）。

### 9.31.4 归档取代删除

删除按钮原本只在展开区右下角，且要 `window.confirm`。归档是**可逆**的，所以能进常驻的
动作行，也能不带确认：同一个按钮再点一次就是取消归档。顺带把 §4.7 的缺口补上了一半 ——
「工作区被删后自动归档」仍未实现（§13.8 的 P6），归档这一档此前没有任何写入者。

为此补了一条 Remote，而不是让客户端直接改字段：

| 层 | 改动 |
| --- | --- |
| `types.ts` | `WorkbenchArchiveRequest { workspaceId, id, archived, expectedUpdateAt? }` |
| `index.ts` | `@Remote('archive') archive()`，走 `mutate` 的所有权 + CAS 校验；`archivedAt` 只在归档时写入，取消归档时**删掉这个键**（`exactOptionalPropertyTypes` 下不能写 `undefined`） |
| `typert.contract.ts` | `archiveRequestSchema` + `INVOCATIONS` 一项 |
| `typert.host.ts` / `typert.remote-client.ts` | 方法签名与类型声明（手维护的两份副本，`remote-contract.spec.ts` 读源码比对） |
| `mount.ts` / `store.ts` | `gateway.archive` + `store.setArchived()` |
| `WorkbenchTab.tsx` | 动作行第三个按钮，`归档` / `取消归档`，图标 `ArchiveGlyph`（DSH 同款归档 SVG：16px、1 描边、箱子 + 勾，见 §9.38） |

`archive` 是唯一**会跨档**的写：其余写回原地合并，归档要把记录从全部/未完成/已完成挪到
已归档（或反向）。因此 `store.setArchived()` 不做 `admit()`，而是先按旧记录减、再按新记录
加计数（计数描述整个工作区，与当前这一页无关），列表里是否留下看 `matchesFilter()`；
`total` 只在「可见性变了」时动。已在目标状态时直接返回，不写库 —— 连点两次不该让
`updateAt` 往前跳、把卡片顶到列表最前面。

删除的入口从面板里彻底消失（`detailBar` / `detailDelete` / `TrashGlyph` 一并删除），Host
的 `delete` Remote 和模型侧的删除工具保留：那是另一条路径，不在这次范围内。

### 9.31.5 展开区不再缩进

`.detail` 从 `2px 0 2px 29px` 改成 `6px 0 2px`：删掉 29px 缩进后，总结与上面的项目行同
一条左缘，展开区本身也不再比元信息行窄。

### 9.31.6 空状态只留图标

待办总结为空时，原来是一行「还没有待办总结，写回后本条自动完结」。上面的分隔线已经写着
待办总结，这句话等于把标题又说一遍，顺带解释一条此刻没人问的规则。现在只画图标：列表空
状态那张「带一行字的纸」，26px、`--wb-tertiary`、70% 不透明，居中在分隔线下。文案没有
丢，它变成了图标的 `aria-label`。

### 9.31.7 度量与阈值（面板 380px）

| 元素 | 值 |
| --- | --- |
| 项目行 / 动作行左缘 | 距卡片左边缘 13.5（= 卡片内距；负 26 抵消点列） |
| 标题 / 描述左缘 | 40（点列右侧，不变） |
| 动作行可用宽 | `面板 - 70`（43 滚动区与卡片外框 + 27 卡内距），比上一版多 26 |
| 三个按钮 + 悬挂 | 59（发送）+ 60（总结）+ 56（归档）+ 75（展开详情）+ 18 间隙 − 3 悬挂 = 265 |
| 折叠阈值 | `@container wb-pane (max-width: 340px)`：归档与展开详情**同时**收成图标（27 + 21），需求降到 182 |
| 展开区 | `padding: 6px 0 2px`，`max-height: 50cqh` |
| 按钮 | 高 26，圆角 10，主/次按钮内距 8，展开控件 4/6 |

只收「展开详情」不够：上一版在面板 320px 实测动作行已溢出 25px，被 spacer 悄悄吃掉（那时
只有两个按钮）。现在靠同一个阈值把两个靠外的控件一起收掉，并留出余量。

### 9.31.8 复验

`node repro/card-preview.mjs` 重新生成预览（新增归档卡、展开且无总结的卡），
`http://localhost:47811/repro/card-preview.html` 看浅色/深色 × 380/320/280。实测：末两行
左缘 14（含 0.5px 边框）、动作行在 380 时 `scrollWidth 312 / client 309`（差的 3px 就是
刻意悬挂）、320 与 280 时 252/249 与 212/209，均不再溢出。`pnpm test` 124 项全绿，其中
`tests/archive.spec.ts` 是本次新增的（Host 的写入/幂等/所有权/CAS 四组，加上客户端快照的
跨档与重算）。

## §9.32 验收后的两处收尾

### 9.32.1 底色只留一方格

第一稿的 `::after` 是「一层柔晕 + 两层点阵」，两种步长互相打拍子，验收时被一眼看出「像
两层矩阵」——要求确保一层，形状改成半透明小正方格。于是柔晕和第二层点阵都删掉，只剩一个
`repeating-conic-gradient`（§9.31.3 已按最终形态改写）。随后再收到「再透明点、方格再小
一些」：格子 8px→6px、方格 4px→3px、总不透明度 .3→.22（每格约 13%）。

楔形的角必须正好 90° 才是正方形，因此方格永远是半个格子 —— 想更小只能连格子一起缩。3px
是把 100% 缩放下的观感定在「看得出是方格、但不抢字」的档位。

### 9.32.2 删掉「写回后本条自动完结」

这句话是 `writeback.hintQueued`，画在「未开始」条目的展开区里 —— 而那时展开区里除了分隔线
只有空状态图标，整块区域唯一的内容就是这句解释。它解释的规则（写回会让本条自动完结）此刻
没人问，而且上面的分隔线已经写着「待办总结」。删除方式与 §9.25 删 `writeback.hintDone`
一致：**键一起退休**，不是留着不用。

现在展开区的提示只剩两种状态，都在动作进行中才出现：已发送等待模型（`writeback.pending`）
和进行中可再次写回（`writeback.hintRunning`）。条件从 `status !== 'done'` 变成
`pending || status === 'in_progress'`，`completion.spec.ts` 里那条「两个语言都要拼出每个
键」的清单同步去掉该键，并新增一条断言：它不许悄悄回来。

### 9.32.3 待办总结区的滚动条常显

展开区在 `max-height: 50cqh` 处自己滚（§9.27），但滚动条原来交给宿主样式，属于「要用才
出现」的浮层。验收要求它一直显示，做法是把这条滚动条接管过来：

- `scrollbar-gutter: stable` —— 不管内容有没有超限，先把 6px 的槽留出来。
- `::-webkit-scrollbar` 6px、透明轨道、圆角 3px 的拇指，墨色走两个新令牌
  `--wb-scroll-thumb`（16% 主墨）/ `--wb-scroll-thumb-hover`（30%）。拇指是控件不是文字，
  所以不用 caption/tertiary 那两级文字色。
- 刻意**不写** `scrollbar-width` / `scrollbar-color`：Chrome 只要看到这两个标准属性就改用
  标准绘制，并忽略 `::-webkit-scrollbar` 那一组，而圆角拇指只有 webkit 这套画得出来。本插件
  只在 Chromium 里跑，没有第二条路要照顾。

`overflow-y: auto` 何时生效见 §9.33。

## §9.33 展开动画期间不许出现滚动条

接上一条之后，验收又抓到一个更细的问题：点「展开详情」的瞬间会先闪一下滚动条，待办总结的
宽度跟着变一次。

原因是 `overflow-y: auto` 跟着 `detailOpen` 类一起打开 —— 也就是弹性的**第一帧**。那时折叠
行才几像素高、摘要已有四百多像素，于是必然溢出：拇指被画出来，再随着高度长上去而缩掉、消
失。`scrollbar-gutter: stable` 只解决了「宽度会不会变」，没解决「拇指提前出现」，两者叠加
就成了一次明显的视觉抖动。

改法是把滚动权的交接推迟到折叠结束：

```css
/* 常驻规则：先裁着，槽照样留着 */
.detailWrap > .detail { overflow: hidden; scrollbar-gutter: stable; }

/* 展开态：380ms 弹簧落地后，用一个 0 长度的动画把 overflow-y 交给 auto */
.detailOpen > .detail { animation: wb-detail-scrollable 1ms linear 400ms forwards; }
@keyframes wb-detail-scrollable { to { overflow-y: auto; } }
```

- 用动画而不是 `transition`：`overflow` 是离散属性，`transition` 需要
  `transition-behavior: allow-discrete` 且结束点不好表达；`animation … forwards` 天然是
  「等一会儿，然后就此定住」。
- 槽在**所有**状态下都留着（折叠态也留），所以文字列从一开始就是窄 6px 的那一版，拇指出现
  时不重排。实测同一张卡：`overflow-y` 在 0/80/300ms 是 `hidden`、650ms 是 `auto`，而
  `clientWidth` 全程 303 —— 宽度抖动没有了。
- `prefers-reduced-motion` 下折叠本身没有过渡（`.detailWrap` 的 transition 被关掉），延迟
  交接就只是白等 400ms，所以在那个块里直接 `animation: none; overflow-y: auto`。

## §9.34 P4：查询与创建两个模型工具

**需求来源**：右栏工作台在 2026-10-22 建的两条待办 ——「插件提供工作项查询工具调用」和
「插件提供工作项创建工具调用」。P4（模型工具）原本整条挂在 §13.8 的欠账里，这次只补
这两条；模型侧的更新、归档、删除工具仍没有。

### 9.34.1 形态：Remote 的薄投影，而不是第二套实现

`src/tools.ts` 构造 `workbench_search` / `workbench_create` 两个 `defineTool` 定义，
由 `WorkbenchService.registerTools` 注册；第三个工具 `workbench_complete` 留在原处
（§11.3），注册入口从 `registerCompleteTool` 改为 `registerTools`。

- 查询工具调的就是 `this.search`，创建工具调的就是 `this.create`：参数校验、模糊三档
  排序、四档计数、「永远是 `open`」、工作区归属检查都只有一份实现。模型看到的排序与
  计数因此就是面板上的排序与计数，不会因为多一条工具路径而漂移。
- 工具层唯一新增的判断是「这次调用作用在哪个工作区」。模型拿不到 workspace id，默认
  从调用会话解析：在 `workspaceRegistry.list()` 里找 `sessionIds` 含该会话的那个工作区
  （该账户经过 header cwd 校验，不是「第一个工作区」）。显式 `workspaceId` 是逃生口，
  供子代理、脚本这类没有工作区归属的调用使用。
- 解析失败一律报错，不退化：未知 `workspaceId` 报 `unknown workspace`，没有会话也没给
  id 报「需要 agent session」，会话不属于任何工作区报「未挂到工作区」。**绝不**把作用域
  悄悄放大到所有工作区 —— 那会把别的项目的待办当成这个项目的，而静默写错位置的创建更糟。

### 9.34.2 契约

| 工具 | 参数 | 默认 / 约束 |
| --- | --- | --- |
| `workbench_search` | `query`、`status[]`、`tag`、`archived`、`limit`、`offset`、`workspaceId` | `query` 省略即全量；`archived` 默认 `exclude`（取 `only` 才看归档）；`limit` 默认 50、上限 200，与 Remote 的 clamp 一致；`status` 传 `["open","in_progress"]` 即「未完成」 |
| `workbench_create` | `title`（必填）、`desc`、`tag`、`workspaceId` | 状态、归档、完成记录都不是输入：创建只能是 `open` |

返回值是 canonical value（不是拼给人看的字符串）：查询返回
`workspaceId/workspacePath/total/counts/items`，`items` 带 `id`、标题、`desc`、`tag`、
`status`、`archived`、`updateAt`、`createdAt` —— `id` 是后续 `workbench_complete` 唯一
认得的句柄。渲染只是它的一个投影：`[ ]`/`[x]`、四档计数行、每行的 `id` 与更新时间。

两条容易做错、已被测试钉住的细节：

- 空结果仍打印计数行。只显示「0 条」会被读成「工作台是空的」，而实际只是查询没命中。
- 创建工具不把 Host 的 `invalid` 包成成功，也不把 `not_found`/`conflict` 当成创建已完成：
  create 面向一条尚不存在的记录，这两种码出现就说明存储层答非所问，应当报错而不是编一个
  成功。

并发标注按实际语义给：`workbench_search` 读快照，标 `isConcurrencySafe`；`workbench_create`
走写路径，不标。

### 9.34.3 复验

`pnpm test` → **139 tests / 28 suites**。新增的 `tests/tools.spec.ts` 有 15 条，覆盖作用域
解析（会话工作区、显式 id、未知 id、无会话、未挂载会话）、可选参数省略、Host 拒绝透传、
输出 schema 校验、渲染文本、以及服务确实注册了三个工具。Host 改动要重启 DSH 才生效。

## §9.35 筛选四档：只有选中的那颗有底色

筛选行试过一版「全部 / 未完成 透明，已完成 / 已归档 常驻淡绿、淡灰」。验收否掉了：

> 不选择的时候不显示背景色，选择的时候才出现对应的背景色。且四个 tag 只能同时激活一个。

所以规则收到最简：

- **未选中 = 没有底色**。四颗都是纯文字压在面板底色上，谁也看不出"已经选中"；只有 hover 时
  出现一层中性的 wash（那是临时的，不写进状态）。
- **只有当前档有底色**：品牌色 9%（`--wb-accent-wash`）配品牌字色，hover 13%。这比筛选行
  第一版的 14% / 20% 淡了两档 —— 回答最初那句「背景色淡 2 个度」。
- **同时只能亮一颗**：这不是样式约束，而是结构约束 —— store 里 `filter` 是单个
  `WorkbenchFilterTier`，`setFilter` 整体替换，所以 `chipActive` 最多挂在一颗上。上一版给
  已完成 / 已归档 加常驻底色，正是把"选中"这件事说成了"这颗有颜色"，三颗一起亮，才让人怀疑
  能多选。现在有颜色的那一颗就是唯一选了的那颗，另外补了 `aria-pressed` 让读屏器也这么念。
- 顺带统一了高度：`chipFlat` 原来给前两颗 26px、后两颗 28px，这个差异没有理由，四颗现在都是
  28px，`chipFlat` 一并删掉。

实测（预览页，不截图）：未选中的三颗背景是 `rgba(0,0,0,0)`，选中的一颗是品牌色 9%、字色是
品牌色；四颗高度都是 28。

## §9.36 调用完工具之后，列表自己刷新

需求原文（待办 `#0d7bfdc6`）：

> 调用完工具之后自动刷新待办列表（待办ID：#0d7bfdc6） 1. 给工具调用方法增加钩子，每次调用之后刷新列表

### §9.36.1 为什么不能用"事件"

最先想的是「工具写完发一个事件，客户端收到就刷新」。走不通，原因不在实现而在边界：

- 浏览器能收到的 cordis 事件是一张**关闭的白名单**
  （`packages/api/remotes/src/remote-events.ts`，28 条：`api-session/status`、
  `api-session/activity` 等）。第三方插件往里加不了条目 —— 这张表属于 Harness，
  不属于插件。
- 已有的两条也都不等于「某次工具调用结束了」：`api-session/activity` 只在用户自己发出
  持久消息时响，`api-session/status` 只在 agent 起停时响。模型在回合中间调一次
  `workbench_create` 然后继续干活，这两条都不会响。

### §9.36.2 所以用流：`workbench/watch`

插件自己能拥有的推送方向只有一个：Remote **stream**。所以给 Service 加了第九个
Remote 方法：

```ts
@Remote({ mode: 'stream' })
async *watch(signal: AbortSignal): AsyncIterable<WorkbenchChange>
```

- `WorkbenchChange` 只有 `{ workspaceId, revision, at }`，**不带改动内容**。通知要回答的
  只有一句「你手上这张列表过期了吗」，而"过期了"最便宜、最诚实的答法就是照原来的
  `search` 再查一遍。把记录塞进通知等于开第二条组装列表的路，迟早会在分页、排序、
  三档计数上和第一条打架（§13.2 的单一权威）。
- 通知在**写落地之后**发出：`mutate` 在队列槽里改完、`create`/`delete` 在 `put`/`delete`
  之后。没落地的写发出去，等于让所有面板去追一条不存在的记录。
- `revision` 是 Host 侧单调计数器。重连后如果同一条通知被重放，面板能认出它。
- 总线在 Service 实例上，不在模块全局：插件重载时旧 watcher 必须跟着死，否则新代码会
  往旧总线里发。
- 队列按 workspace **合并**、并有 64 条上限：一次批量写 20 条同工作区记录，面板只需要
  听到一次"再看一眼"；慢面板也不会把这里撑成泄漏。

### §9.36.3 客户端只有一处消费：`followChanges`

`client/changes.ts` 里的 `followChanges` 是纯函数（流打开方式、面板集合、定时器都可注入），
`mount.ts` 只负责接线：

- **一次挂载一条流**，不是每个面板一条。通知到了以后，各自比较
  `store.workspaceId === change.workspaceId` 决定要不要重查 —— 一个面板正在看 A、
  另一个在看 B，写 A 只该打扰前者。
- **重连后必须无条件重查一遍**：断线期间的通知已经没了，这是唯一能补回来的办法。
  首次打开不算重连（那时候面板要么还没打开、要么正在 `load()`，重查只是白跑一次查询）。
- **有界重试**：连续失败上限 8 次，退回 250ms 起、封顶 4s。到顶就记一条 error 然后停 ——
  一个永远在重试的静默循环，会让"列表很久没变"看起来像"没有变化"，这比报错更糟。
  连接换代（`connection/reset`）时用一份全新的预算重启；这条事件首连也会发一次，
  多重启一次无害。
- 第一次 `next()` 之前就订阅：`watch()` 里直接构造一个 `WorkbenchWatcher`（不是
  async generator —— generator 的函数体要等第一次 `next()` 才跑），否则 Host 端
  "打开方法"和"开始读"之间落下的写会被静默丢掉。

### §9.36.4 代价

- 本地自己的写也会收到自己的通知，于是多一次 `search`。接受了：查询结果和本地合并结果
  本应一致，多查一次是"顺手把合并结果校正一遍"；要区分"是不是我自己写的"需要给通知
  加一个来源字段，而 Host 分不清"哪个 peer 写入的"，加了这个字段也只是猜。
- 面板在编辑描述时收到重查，草稿在组件里、不在快照里，所以不会被打断。

### §9.36.5 实测

- `pnpm build` 两遍通过（Host 面 + 浏览器面）：`tsc` 检查 `mode: 'stream'` 的
  `RemoteStreamHandle` 面、`connection/reset` 的事件类型。
- `pnpm test`：**151 tests / 30 suites**，全绿。新增 `tests/changes.spec.ts`
  覆盖总线（投递、合并、per-workspace 保留、空 workspace 忽略、abort 后注销、
  两个 watcher、`revision` 递增）与 `followChanges`（只重查对应面板、重连全量重查、
  8 次后放弃、dispose 后不再尝试）。
- `remote-contract.spec.ts` 增加：`watch` 的通告 schema、以及**描述符的 `mode` 必须
  等于装饰器 marker 的 `mode`** —— 手写描述符和 marker 各自能改，Gateway 只读后者。

## §9.37 列表空状态换成插画

列表为空时不再画 `EmptyGlyph` 那个 28px 的线框纸页，改用一张鲸鱼与空纸箱的插画
（原图 `empty.png`，1402×1122、带透明通道）。

### §9.37.1 素材

- 先按 alpha>1 的包围盒裁掉四周透明边（`154,157,1095,909`），再缩到宽 600：
  `cwebp -q 92 -crop 154 157 1095 909 -resize 600 0 -alpha_q 100 -m 6`，
  输出 `src/client/assets/empty.webp`（600×499，约 96 KB）。裁边让插画在 240px 的
  显示宽度里占满画面，而不是显示一半透明留白。
- alpha 用无损（`-alpha_q 100`），否则深色主题下透明边会出灰边。

### §9.37.2 打包方式

浏览器产物是**单个** `client.js`，由插件路由提供，同目录多出一个图片文件没有 URL 可请求。
因此 `tsdown.client.ts` 新增 `dsh-asset-inline`：`.png/.webp/.jpg/.gif/.avif` 的 import
在打包时变成 `data:` URL 字符串（`ASSET_MIME` 决定 MIME），并 `addWatchFile` 让监视
包含物理文件。`css-modules.d.ts` 只声明 `*.webp` / `*.png` 两个模块类型。

代价是 `client.js` 多约 129 KB（base64）。接受：图片只有一张，gzip 后增量远小于这个数，
而外置文件在当前产物形态下无法加载。

### §9.37.3 显示

`.emptyArt`：`width: 100%; max-width: 240px; height: auto`，在 320px 面板里也不挤。
图是装饰性的（`alt=""` + `aria-hidden`），图下只留**一行**文案：列表为空时
「点击「+」新建一条」，筛选或搜索空档时「换个筛选档，或把搜索词清空。」。
原来的标题行（「这个工作区还没有工作项」/「这一档没有工作项」）连同 `empty.title`、
`empty.filteredHint` 两个 key 一起删掉 —— 插画已经说了列表是空的，标题只是把这句话
再说一遍。`width/height` 写死 600×499 以免解码前跳动。
`EmptyGlyph` 与 `.emptyGlyph` 随列表空状态一起删除；待办总结区的 `detailEmpty` 图标
是另一处，保留。

### §9.37.4 复验

- `pnpm build` 两遍通过，`pnpm typecheck` 通过，`pnpm test` 151 tests 全绿。
- 产物内 base64 解码后与原 webp 的 sha256 一致；`emptyGlyph` 已不在产物里。
- 用 headless Chrome 按 320px 面板宽度渲染日/夜两套主题核对：插画居中、文字间距正常。

## §9.38 归档按钮改用 DSH 自带的归档图标

待办 #1c7bd132：「目前图标头部比较重，导致视觉上感觉图标比文字高」。

### §9.38.1 问题

旧画法是本文件里手绘的 13px 图标：箱盖是一个比箱体宽的封闭圆角矩形
（`y 3–6.1`、`stroke 1.3`）。13px 下盖子的上下两条横边只隔约 1.5px，抗锯齿后
糊成一条深色横杠，图标的墨色全压在 16 格的上半部，底部的箱体只有细边和一个小
箭头，压不住。于是眼睛按"上面那砣"定位，控件看起来浮在「归档」上方。

### §9.38.2 决定：用 DSH 的 element，按行内 13px 居中

用户给出 DSH 中的归档 SVG：

```html
<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor"
     stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" stroke-width="1">
  <rect x="1.9" y="2.1" width="12.2" height="3.4" rx="1.1"></rect>
  <path d="M2.95 5.7v4.8a2.9 2.9 0 0 0 2.9 2.9h4.3a2.9 2.9 0 0 0 2.9-2.9V5.7"></path>
  <path d="m6 9.35 1.4 1.4 2.6-2.6"></path>
</svg>
```

`ArchiveGlyph` 用它的三段几何，属性名换成 JSX 驼峰；尺寸跟同一行的手绘图标一样
取 13px（`width/height="13"`，viewBox 仍是 16，所以 `stroke 1` 实际落成约 0.81px，
比旧画法的 1.3 轻）。它解决旧画法的三个问题：

- 盖子的两条横边在 13px 下间隔约 2px（3.4 单位的盖子），不再糊成一条深色带。
- 箱体 `x 2.95–13.05` 只比盖 `x 1.9–14.1` 窄 1.05/边，读起来是"箱盖"而不是蘑菇头。
- 内部是勾不是箭头：归档在 DSH 里就是"箱子 + 勾"，用同一套语义，不要改回箭头。

但元素自身在画布里偏上：把描边算进去，墨色在 16 格里是 `y 1.6–13.9`，上边 1.6、
下边 2.1；缩到 13px 后就是"顶部占满、底部空一截"。不重画路径，给三段几何套一个
`<g transform="translate(0 0.3)">`：墨色变成上下各 1.9，中心从 7.75 落回 8.0，
在 26px 按钮里居中后与 12px 文字的「中宫」齐平。

### §9.38.3 复验

- `pnpm build` 两遍通过，`pnpm test` 151 tests 全绿。
- 13px 下按 10× 栅格（160px 画布）量墨色：`translate(0 0.3)` 前上 1.6 / 下 2.1，
  之后上下各 1.9（单位为 16 格）。
- headless Chrome 用真实 `.archiveBtn` 样式渲染 1x / 3x、日/夜、带字/纯图标
  （窄面板隐藏 `.archiveBtn > span`）四种组合：盖子不再成带，图标与「归档」中宫对齐，
  纯图标状态仍能读出箱子与勾。

## §9.39 workbench_complete 不再记录验证结果

用户要求待办总结里不要「验证结果」这一节，并且要改代码里的约定，而不是只靠调用方自觉。

- 工具的 `parameters`、`WorkbenchCompletionInput` 与 `completionFromInput` 都删掉
  `verification`；工具描述和写回提示词同步，不再要求模型附命令。
- 替换记录时只比对 `changedFiles`：旧记录里的命令历史不再参与「少写即拒绝」的判定，
  新契约里它不是必须重报的事实。文件仍然只增不减。
- 兼容：`WorkbenchCompletion.verification` 改为可选，`storage.ts` 与
  `typert.contract.ts` 继续接受旧记录里的数组，卡片仍显示旧记录的历史（用户选择保留
  旧记录）。新写回没有该字段，这一节自然不出现。
- 改动集中在 `types.ts`、`completion.ts`、`index.ts`、`storage.ts`、
  `typert.contract.ts`、`client/write-back.ts`、`client/WorkbenchTab.tsx` 与两个
  spec；`lib/` 产物已重建。

## §9.40 折叠态不再被展开区的 padding 撑高

「详情未展开时底部比顶部空」。原因不在流程空隙，而在 `.detail` 自己：它是
`grid-template-rows: 0fr` 的网格项，但身上带着 `padding: 6px 0 2px`。网格项被压到 0
高时，padding 不会跟着消失，折叠态于是仍站 8px，卡片底部就多出一条。

- `padding` 移到内层 `.detailBody`；`.detail` 只留 `padding: 0`。内层内容随折叠一起被
  `overflow: hidden` 裁掉，折叠高度真正为 0，展开时上下间距不变。
- 保留 `visibility` 与常驻挂载（§9.18、§9.27）：这里只是让 0fr 真的是 0，不是改用
  `display: none` 取消折叠动画。
- 复验：等价结构在 headless Chrome 里量，折叠前 8px、折叠后 0；编译后的 CSS 里
  `.detail` 为 `padding: 0`、`.detailBody` 为 `6px 0 2px`。`pnpm build` 与
  `pnpm test`（152 tests）通过。

## §9.41 标题行高度不随状态变化

未完成 → 已完成切换时卡片抖一下。原因只在标题行：状态胶囊仅在 `open` 之后渲染，
旧规则是 `height: 21px`（content-box）加 `0.5px` 边框，实际外高 22–23px；标题按钮是
20px 行盒，于是同一行在有无胶囊时差 2–3px，整张卡跟着变高。

- `.titleRow` 固定 `height: 20px`；`.statusPill` 改 `box-sizing: border-box`，
  `height: 20px`。两者都落在标题的 20px 行盒里，状态切换不再改变标题行高度。
- 复验：headless 量三组——无胶囊 20、旧胶囊 23、修后胶囊 20；`pnpm build` 与
  `pnpm test`（153 tests）通过。

## §9.42 状态标记改用设计图

标题前的未完成 / 完成标记不再用 CSS 圆点，改用 image2.5 生成的两张设计图。

- 素材：`todo.png`、`done.png`（1254²，透明底）。先按 alpha ≥ 8 去掉生图边缘的淡晕，
  再把 8–255 映射回 0–255 保住抗锯齿；按内容裁切（todo 571×575，done 722×745），
  补成正方形、缩到 128²，存为无损 WebP（4.1 KB / 10.4 KB）。
- 接入：两张图都只当 alpha mask（`mask-image` + `background: currentColor`），
  墨色仍由主题令牌给——未完成取 idle ink，完成取 accent，所以浅色 / 深色、归档
  55% 透明都能自动适配。标记槽仍是 20px，图形 16px，四周各留 2px。
- 已完成不再叠 `--wb-accent-soft` 光晕：徽章本身已是实心图形。进行中与新建
  卡片仍保留原来的绿点 + 光晕（进行中没有对应的设计图）。
- 校验：`pnpm build` 通过，`pnpm test` 156 tests；3× headless 预览确认 16px 下
  齿边和镂空对勾仍可辨，深色主题下对勾透出卡片底色。

## §9.43 修改文件：路径列固定五分之一，超出才出 Tooltip

待办总结的「修改文件」里，路径原来会和用途抢宽度：路径越长，右侧的用途被挤得越窄，
同一块里的两行也对不齐。

- `.filePath` 改为固定 `flex: 0 0 20%`，即整行的五分之一；用途列 `flex: 1 1 0` 拿走
  剩余宽度。路径不再换行，改为 `overflow: hidden` + `text-overflow: ellipsis`。
- 只有真的被截断时才给完整路径：`FilePath` 用 `scrollWidth > clientWidth` 量，
  变宽变窄（`ResizeObserver`）和路径变化时重新量；没截断则 `Tooltip` 保持 `disabled`，
  不重复屏幕上的字。气泡走 `portal` + `side="top"`，避免被展开区的 `overflow` 裁掉。
- `Tooltip` 取自 `@deepseek-ai/dsh-client-ui-primitives`；它本来就在 DSH 的平台模块表里，
  客户端构建保持 external，运行时由 Shell 共享，不新增注入项。
- 复验：`pnpm build` 通过，`node --test --test-isolation=none` 157 tests 通过；
  `completion.spec.ts` 新增一条断言钉住 20% 列宽、省略号与「仅截断才出气泡」。

## §9.44 待办总结上限再收 20%，分割线固定在滚动区之外

待办总结展开后的最大高度从 `50cqh` 收到 `40cqh`（原来的 80%），并且滚动时
「待办总结」那条分割线保持不动，只有它下方的总结内容滚动。

- 上限仍挂在始终匹配的 `.detailWrap > .detail` 上（§9.27），折叠的起止高度不变。
- `.detail` 改为纵向 flex：`.completionDivider` 是 `flex: none` 的固定项，后面新增
  `.detailScroll` 才承担滚动（`flex: 1 1 auto; min-height: 0`）。分割线不在滚动容器里，
  因此不会被第一屏内容带走。
- §9.33 的延迟出条和 `scrollbar-gutter: stable` 一起搬到 `.detailScroll`；
  `::-webkit-scrollbar` 选择器同步改到该块，滚动条仍只在折叠动画结束后出现。
- 分割线右侧留 6px，与滚动区预留的滚动条槽对齐；`prefers-reduced-motion` 下仍立即
  交出 `overflow-y: auto`，只是对象从 `.detail` 换成 `.detailScroll`。
- 复验：`pnpm build` 通过，`node --test --test-isolation=none` 158 tests；
  `motion.spec.ts` 新增一条结构断言（分割线先闭合、滚动块后打开）。

## §9.45 待办列表滚动条内缩 6px

待办列表的滚动条原先贴死面板的右边缘和底边缘，看起来像被裁掉的一条边。现在给
`.scroller` 加 `margin: 0 6px 6px 0`，滚动条整体内缩 6px；同时把
`padding` 从 `14px 14px 24px` 改为 `14px 8px 18px 14px`。

- 右侧：`margin-right 6 + padding-right 8` 与原来的 `padding-right 14` 相等，
  卡片的右缘不动；滚动条与卡片之间留 8px。
- 底部：`margin-bottom 6 + padding-bottom 18` 与原来的 `padding-bottom 24` 相等，
  最后一张卡片下方的留白不变，滚动条底端离面板底边 6px。
- `scrollbar-gutter: stable` 和 `overflow: auto` 保持不变；`.scroller` 仍是 `40cqh`
  的尺寸容器（高度少 6px，上限相应少约 2.4px）。
- 复验：`pnpm build` 通过，`node --test --test-isolation=none` 159 tests；
  新增 `scroller.spec.ts` 同时钉住 margin 和补偿后的 padding。

## §9.46 列表上下边缘 14px / 18px 渐隐

列表滚动时，卡片会在滚动区顶边和底边被硬边切断。`.scroller` 现在用
`mask-image: linear-gradient(to bottom, transparent 0, #000 14px, #000 calc(100% - 18px), transparent 100%)`
把两端渐隐到透明。

- 渐隐长度直接取 top/bottom padding：静止时首尾卡片完全落在不透明区，不会被
  蒙层压淡；只有滚动中的卡片会经过渐隐带。
- 用 mask 而不是半透明渐变遮罩，是因为遮罩颜色必须猜侧栏的 fill token；mask
  淡到透明，深浅主题都不需要额外变量。
- 滚动条与内容同一层，顶端/底端的渐隐也覆盖滚动条两端。
- 复验：`pnpm build` 通过，`node --test --test-isolation=none` 160 tests；
  `scroller.spec.ts` 新增断言钉住渐隐停点与 padding 相等。

## §9.47 侧栏页签图标改用设计图

工作台页签开头的图标原来是一个 14px 的内联 SVG 清单（两个复选框加两条横线），
在页签里笔画细、缩到 14px 后读起来像一团灰。现在换成 image2.5 生成的设计图。

- 素材：`tab-icon.webp`（128²，约 5.6 KB，透明底，有损压缩 quality 92）。第一轮是
  单色剪影方案；用户试过 4:3 后要求更有设计感的彩色样式，最终改为一版全彩图：
  三张层叠的圆角任务卡，最上面一张是蓝紫渐变（亮蓝 #4C8DFF → 靛紫 #6B4CE6）带
  白色粗对勾，下层青绿、紫色衬卡，1:1 构图、近乎正立。
- 管线与 §9.42 相同但**保留颜色**：按 alpha ≥ 8 去掉生图边缘的淡晕，再把 8–255
  映射回 0–255 保住抗锯齿；按内容裁切（961×835），补成正方形，四周再留 20% 空气
  （图形占 80%），最后缩到 128² 存 WebP。存的是全彩像素，无损改 92 有损——
  渐变看不出色带，颜色混合本身比剪影多占了体积。
- 留白是必须的：素材是画到边的，而它替换掉的 SVG 只把墨迹画在 viewBox 的 11/16 处；
  不留白的话新图标会比旧的高出约 46%，在页签里顶到行高。
- 接入：**不用**状态标记那套 alpha mask（§9.42）——mask 会把图重染成
  `currentColor`，渐变就没了。改为组件里直接
  `style={{ backgroundImage: \`url(${tabIcon})\` }}`，`.titleIcon` 只负责
  16×16、contain、居中、`margin-right: 4px`、`vertical-align: -3px`（14px 读着
  偏小，放大到 16px；基线偏移从 -2px 改 -3px 是为了让图标的光学中心和 14px 框
  时一致）。间距用 `margin-right: 4px`——素材内缩 20%，自带的空气一侧约 1.6px，
  已补上旧 SVG 收窄的部分。颜色固定意味着不再跟随页签的悬停/选中色，这是全彩
- 选型：第一轮 12 个单色候选（回形板、清单、看板、笔记本、印章等）在 14px 对照表
  里，看板 / 笔记本 / 印章糊成团，印章又和卡片里已有的「完成」印章撞脸，选了回形板；
  第二轮改全彩「应用图标」式，4 个候选出齐后用户点名层叠卡片，再出 3 个 1:1 版本
  选了对称扇形那版。层叠卡在 14px 仍能读出"一叠工作了结的卡片"。
- 复验：`pnpm build` 通过，`node --test --test-isolation=none` 163 tests；
  另用脚本把**成品素材**（不是 1254px 原图）在 14 / 20 / 28 / 42px、浅深两色下
  各渲染一遍确认可辨；`tab-icon.spec.ts` 钉住 background-image 契约与素材文件。

## §13.8 遗留欠账

- `dsh.client.inject` 不一致：客户端源码 import 了
  `@deepseek-ai/dsh-client-ui-slots`（裸导入），但根 `package.json` 的 inject 表里
  没有这一项；`packages/workbench/package.json` 里反而有 10 项。目前不影响加载，
  属于待收敛的声明。
- `files` 里列了 `README.md` / `README.zh.md`，但两个文件都不存在（本次事故前就
  不存在）。
- 没有「工作项 → 快捷键」入口；短 id 解析（用户输入前缀匹配）未实现。
- 没有 `tsconfig.test.json`，测试文件靠 `tsc -b` 的 include 边界兜住。
- 路线图未做：P6 工作区删除后的归档、P7 可选项、P8 回合中止。P4 的查询/创建两个模型工具
  已在 §9.34 补上，模型侧的更新、归档、删除等其余写工具仍未做。注意 §9.31.4
  之后「归档」这一档已经有用户动作在写了，P6 补的是另一个来源（工作区被删），两者共用
  `archived` 一个字段。
- `delete` Remote 现在既没有面板入口（§9.31.4 用归档取代了它），也没有模型工具调用它；
  留着是为了那条 Remote 路径仍然完整。若确认不再需要，可以连同 `TrashGlyph` 时代的清理
  一起删。
- 上游限制：Typert 生成器不能分析 monorepo 外的插件，`typert.host.ts` /
  `typert.remote-client.ts` 因此手写，靠 `remote-contract.spec.ts` 防漂移。
- 插件安装在 profile 里用 `link:`，卸载/重建 profile 可能再次删到仓库（§0）。
- §9.36 的通知流只回答"这张列表过期了"，不含**谁**改的。想做"别的会话改了我的条目"
  这类提示，得先有 peer 身份，目前 Host 分不出来。
