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
5. `.cardFoot` — `.primaryBtn`（发送）、`.ghostBtn`（总结）、`.footSpacer`、
   `.cardActions > .chevron`（展开详情 / 收起详情）。没有可发送目标时主按钮不渲染。

折叠态仍是 `grid-template-rows: 0fr → 1fr` + `visibility` 的既有折法（§9.25），
展开区缩进改成 29px：与标题左缘对齐（13 卡内距 + 20 点 + 9 间隙 - 4 字段内缩）。

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
  参考图有 4 个按钮；归档不做一个，因为归档不是用户动作（工作区被删时工作项自动归
  档，§4.7），造一个 Host 不支持的动作比少一个按钮更糟。
- **窄面板先牺牲文字**：`@container wb-pane (max-width: 340px)` 时收掉“展开详情”四
  个字，只留箭头（`aria-label` / `title` 仍在），保住“发送”“总结”两个动词的标签。
  阈值按 footer 的真实预算算出：面板 - 95px 可用（28 scroller 内距 + 15 滚动条槽 +
  26 卡内距 + 31 点列 + 5 悬挂），三个带文字的控件要 229px。
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
| 元信息 | 11.5px / 17px，图标 12，与描述同色 |
| 动作 | 高 28，12px / 500，圆角 9；主按钮内距 10，次按钮 8，展开控件 4/6 |
| 展开区 | 左缩进 29，`max-height: 50cqh` |

### 9.30.5 保留的不变量

内联编辑里“输入框盒子 == 展示盒子”（横向 4px 内缩，行高一致）、单一
`--wb-jelly` 弹簧、`prefers-reduced-motion` 全覆盖（新增点、按钮、胶囊小点）、
展开区最多一条处置规则、删除只在展开区内。`field-metrics.spec.ts` /
`motion.spec.ts` / `completion.spec.ts` 里对应的断言已同步：旋转改 180°（箭头朝下即
展开）、`.cardActions > button` 这条顶格规则已不存在、写回等待态改名
`.ghostBtnPending`。

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

## §13.8 遗留欠账

- `dsh.client.inject` 不一致：客户端源码 import 了
  `@deepseek-ai/dsh-client-ui-slots`（裸导入），但根 `package.json` 的 inject 表里
  没有这一项；`packages/workbench/package.json` 里反而有 10 项。目前不影响加载，
  属于待收敛的声明。
- `files` 里列了 `README.md` / `README.zh.md`，但两个文件都不存在（本次事故前就
  不存在）。
- 没有「工作项 → 快捷键」入口；短 id 解析（用户输入前缀匹配）未实现。
- 没有 `tsconfig.test.json`，测试文件靠 `tsc -b` 的 include 边界兜住。
- 路线图未做：P4 模型工具、P6 工作区删除后的归档、P7 可选项、P8 回合中止。
- 上游限制：Typert 生成器不能分析 monorepo 外的插件，`typert.host.ts` /
  `typert.remote-client.ts` 因此手写，靠 `remote-contract.spec.ts` 防漂移。
- 插件安装在 profile 里用 `link:`，卸载/重建 profile 可能再次删到仓库（§0）。
