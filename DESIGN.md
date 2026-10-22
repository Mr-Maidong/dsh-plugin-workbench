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
| 构建 + 测试 | `pnpm test` → 当前 **113 tests / 21 suites**，全绿 |

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
| `WorkbenchTab.tsx` | 动作行第三个按钮，`归档` / `取消归档`，图标 `ArchiveGlyph`（盒子 + 向下箭头，13px、1.3 描边，和行内其他图形同重量） |

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

## §13.8 遗留欠账

- `dsh.client.inject` 不一致：客户端源码 import 了
  `@deepseek-ai/dsh-client-ui-slots`（裸导入），但根 `package.json` 的 inject 表里
  没有这一项；`packages/workbench/package.json` 里反而有 10 项。目前不影响加载，
  属于待收敛的声明。
- `files` 里列了 `README.md` / `README.zh.md`，但两个文件都不存在（本次事故前就
  不存在）。
- 没有「工作项 → 快捷键」入口；短 id 解析（用户输入前缀匹配）未实现。
- 没有 `tsconfig.test.json`，测试文件靠 `tsc -b` 的 include 边界兜住。
- 路线图未做：P4 模型工具、P6 工作区删除后的归档、P7 可选项、P8 回合中止。注意 §9.31.4
  之后「归档」这一档已经有用户动作在写了，P6 补的是另一个来源（工作区被删），两者共用
  `archived` 一个字段。
- `delete` Remote 现在没有面板入口了（§9.31.4 用归档取代了它），只剩模型工具在用。留着
  是为了那条路径仍然完整；若确认不再需要，可以连同 `TrashGlyph` 时代的清理一起删。
- 上游限制：Typert 生成器不能分析 monorepo 外的插件，`typert.host.ts` /
  `typert.remote-client.ts` 因此手写，靠 `remote-contract.spec.ts` 防漂移。
- 插件安装在 profile 里用 `link:`，卸载/重建 profile 可能再次删到仓库（§0）。
