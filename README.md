# dsh-plugin-workbench

A work-item workbench in the DSH right Sidebar: every workspace keeps its own list of work
items, searchable and editable in place, with a write-back loop that lets the model finish
them.

[中文 README](README.zh.md)

## What it does

- **Per-workspace work items.** Items live in the workspace the conversation belongs to;
  switching conversations switches the list. Nothing shows when a session is outside a
  workspace.
- **Fuzzy search.** One box searches title, description, and tag, scoring prefix > substring >
  subsequence, then falls back to recency.
- **Four filters with counts.** 全部 / 未完成 / 已完成 / 已归档 (`all / active / done /
  archived`), plus a filter-aware empty state.
- **In-place editing.** Create, rename, edit the description, set a tag, delete with
  confirmation. An item's status is written by the write-back loop, not by hand.
- **Write-back.** Sending an item as 待办总结 (`write-back`) posts it into the conversation;
  the model's reply is written back onto the item, which completes itself. The request is
  idempotent, so a retry cannot duplicate a completion.
- **Small conveniences.** Copy an item as Markdown, or fill its title into the composer.
- **Bilingual.** zh-CN and en-US UI strings ship with the plugin.

## Requirements

| | |
| --- | --- |
| DSH | `>=0.2.1-rc.2 <0.3.0` (declared as `engines.dsh`; the profile's compatibility check reads it) |
| Node | `^22.19.0 \|\| >=24.0.0` |

The DSH peer dependencies are pinned to exact `0.2.1-rc.2` versions on purpose: pnpm
resolves prerelease ranges unpredictably, so a range would install a mix of versions.

## Install

### From GitHub

```bash
dsh plugin --profile desktop add git+https://github.com/Mr-Maidong/dsh-plugin-workbench.git
```

pnpm clones the repository and runs its `prepare` script, which builds `packages/workbench/lib`
on the spot — the built output is intentionally not committed.

### From a local clone

```bash
git clone https://github.com/Mr-Maidong/dsh-plugin-workbench.git
dsh plugin --profile desktop add ./dsh-plugin-workbench
```

### Restart DSH

The Host half is loaded during boot, so a freshly installed plugin only appears after a
restart. Client-side edits alone need nothing more than a page refresh.

### Uninstall

```bash
dsh plugin --profile desktop remove dsh-plugin-workbench
```

> **Before uninstalling a local-path install, back the clone up.** pnpm installs a directory
> as a link (junction), and profile cleanup has been observed to follow such a link and delete
> files inside the linked directory. See `DESIGN.md` §0 for the incident.

## Usage

1. Open the right Sidebar and pick the 工作台 (`Workbench`) tab.
2. `+` creates an item in the current workspace; the search box and the filter row sit above
   the list.
3. Click a card's description to edit it inline: `Enter` commits, `Shift+Enter` adds a line,
   `Esc` reverts.
4. `待办总结` sends the item into the conversation. When the model answers, the answer is
   appended as the item's completion and the item moves to 已完成.

## Storage

Items are stored through `@deepseek-ai/dsh-storage-domain` in the workspace's own domain, so
they travel with the workspace and never leak across workspaces.

## Development

```bash
pnpm install
pnpm build          # tsc + tsdown for the Host half and the browser half
pnpm test           # 113 tests / 21 suites on Node's built-in runner
pnpm typecheck
```

- Host half: `packages/workbench/src/index.ts` → `lib/index.js`.
- Browser half: `packages/workbench/src/client/**` → `lib/client.js`.
- The Typert manifests in `src/typert.host.ts` and `src/typert.remote-client.ts` are written by
  hand because the upstream generator cannot analyze a plugin outside the DSH monorepo;
  `tests/remote-contract.spec.ts` holds them to the shipped Remote contract, including the
  manifest shape the runtime loader requires.
- `prototype/` holds the static HTML prototypes the UI was designed against, and `repro/` a
  mounting harness.

## License

MIT — see [LICENSE](LICENSE).
