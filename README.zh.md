# dsh-plugin-workbench

DSH 右侧栏里的「工作台」标签页：每个工作区各自维护一份工作项清单，可模糊搜索、就地编辑，
并有一条把工作项交给模型收尾的写回链路。

[English README](README.md)

## 它做什么

- **工作项按工作区存放。** 清单跟着会话所在的工作区走；会话不在任何工作区里时不显示内容。
- **模糊搜索。** 一个搜索框同时搜标题、描述、标签，评分顺序是前缀 > 子串 > 子序列，同分按
  最近更新排序。
- **四档筛选带计数。** 全部 / 未完成 / 已完成 / 已归档，空状态文案也区分「本来就没有」和
  「这一档没有」。
- **就地编辑。** 新建、改标题、改描述、设标签、归档（可逆，同一个按钮再取消归档）。状态不
  手改 —— 由写回自动推进。
- **写回（待办总结）。** 把工作项作为「待办总结」发进对话，模型回答后写回成该工作项的完成
  内容并自动完结。请求幂等，重试不会重复写回。
- **两个小便利。** 复制为 Markdown；把标题填进输入框。
- **中英双语。** 插件自带 zh-CN / en-US 文案。

## 环境要求

| | |
| --- | --- |
| DSH | `>=0.2.1-rc.2 <0.3.0`（写在 `engines.dsh` 里，由 profile 的兼容性检查读取） |
| Node | `^22.19.0 \|\| >=24.0.0` |

DSH 的 peer 依赖刻意锁死到精确的 `0.2.1-rc.2`：pnpm 解析预发布范围不可靠，用范围会装出
混合版本。

## 安装

### 从 GitHub 装

```bash
dsh plugin --profile desktop add git+https://github.com/Mr-Maidong/dsh-plugin-workbench.git
```

pnpm 以 tarball 形式取仓库。构建产物 `packages/workbench/lib` 已入库，所以安装时不需要构建
—— 这一点也有实际原因：对 git 托管的包，pnpm 默认禁止执行构建脚本，除非把每个精确的
tarball URL 加进 profile 的 allowlist。

### 从本地克隆装

```bash
git clone https://github.com/Mr-Maidong/dsh-plugin-workbench.git
dsh plugin --profile desktop add ./dsh-plugin-workbench
```

### 装完要重启 DSH

Host 半边在启动时装载，所以新装的插件要重启后才出现；只改客户端的话刷新页面即可。

### 卸载

```bash
dsh plugin --profile desktop remove dsh-plugin-workbench
```

> **本地路径安装的，卸载前先备份克隆目录。** pnpm 把目录装成链接（junction），已经出现过
> profile 清理跟随该链接、删掉被链接目录里文件的事故。经过见 `DESIGN.md` §0。

## 用法

1. 打开右侧栏，选「工作台」标签页。
2. 按「+」在当前工作区新建一条；搜索框和筛选行在列表上方。
3. 点卡片的描述就地编辑：`Enter` 提交，`Shift+Enter` 换行，`Esc` 撤销。
4. 点「待办总结」把这条发进对话；模型回答后内容写回该条并自动标记为已完成。

## 存放位置

工作项通过 `@deepseek-ai/dsh-storage-domain` 存进工作区自己的 domain，跟着工作区走，不会
跨工作区串。

## 开发

```bash
pnpm install
pnpm build          # Host 半边与浏览器半边分别 tsc + tsdown
pnpm test           # Node 内置测试运行器：113 tests / 21 suites
pnpm typecheck
```

`packages/workbench/lib` 是入库的，因为安装消费的就是它：改完源码要重新构建并一起提交，否则
新安装拿到的还是旧产物。

- Host 半边：`packages/workbench/src/index.ts` → `lib/index.js`。
- 浏览器半边：`packages/workbench/src/client/**` → `lib/client.js`。
- `src/typert.host.ts` 与 `src/typert.remote-client.ts` 是手写的 Typert 清单：上游生成器分析
  不了 monorepo 外的插件。`tests/remote-contract.spec.ts` 把它们钉在已发布的 Remote 契约上，
  也包括运行时 loader 要求的清单形状。
- `prototype/` 是 UI 设计时对照的静态 HTML，`repro/` 是挂载复现装置。

## 许可证

MIT，见 [LICENSE](LICENSE)。
