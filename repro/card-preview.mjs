/**
 * Render the workbench card from the *built* CSS module, outside the app.
 *
 * The plugin's stylesheet is a CSS module compiled into `lib/client.js` as one
 * injected string plus a `{ localName: hashedName }` map. This script lifts both
 * out of the bundle and writes a static preview page, so the card can be looked
 * at in a browser without the Desktop app: the class names and the declarations
 * are the shipped ones, not a copy.
 *
 * Usage: node repro/card-preview.mjs [outfile]
 */
import { readFileSync, writeFileSync } from 'node:fs'
import vm from 'node:vm'

const BUNDLE = 'packages/workbench/lib/client.js'
const TAG = 'dsh-plugin-workbench/WorkbenchTab.module.css'
const OUT = process.argv[2] ?? 'repro/card-preview.html'

const bundle = readFileSync(BUNDLE, 'utf8')

/** The CSS string literal injected for this module. */
function cssText() {
  const anchor = bundle.indexOf(TAG)
  if (anchor === -1) throw new Error(`${TAG} not found in ${BUNDLE}`)
  const at = bundle.lastIndexOf('const css', anchor)
  const quote = bundle.indexOf('"', bundle.indexOf('=', at))
  let i = quote + 1
  for (; i < bundle.length; i += 1) {
    if (bundle[i] === '\\') { i += 1; continue }
    if (bundle[i] === '"') break
  }
  return vm.runInNewContext(bundle.slice(quote, i + 1))
}

/** The module's `{ localName: hashedName }` map. */
function classMap() {
  const at = bundle.indexOf(TAG)
  const window = bundle.slice(at, at + 6000)
  const out = {}
  for (const [, key, value] of window.matchAll(/"([A-Za-z0-9_]+)":\s*"(SWF62W_[A-Za-z0-9_]+)"/g)) out[key] = value
  if (Object.keys(out).length === 0) throw new Error('class map not found')
  return out
}

const stylesheet = cssText()
const css = classMap()
const cls = (...names) => names.flat().filter(Boolean).map(name => {
  if (!(name in css)) throw new Error(`no class named ${name}`)
  return css[name]
}).join(' ')

/* The glyphs, copied from WorkbenchTab.tsx so the preview draws the same ink. */
const icon = {
  send: `<svg width="14" height="14" viewBox="0 0 1024 1024" fill="currentColor" aria-hidden="true"><path d="M826.709333 142.336a32 32 0 0 1 46.72 32.128l-78.293333 656.981333a32 32 0 0 1-44.672 25.472l-202.069333-89.130666-106.965334 108.074666a32 32 0 0 1-54.442666-18.133333L386.688 853.333333v-158.805333l-250.453333-131.669333a32 32 0 0 1-4.053334-54.144l4.010667-2.474667z m-28.629333 123.434667l-342.186667 429.397333a32.085333 32.085333 0 0 1-5.12 5.12l-0.085333 75.221333 67.712-68.394666a32 32 0 0 1 31.018667-8.405334l4.650666 1.664 182.613334 80.512 61.397333-515.114666z m-91.562667 12.202666L219.818667 534.485333l198.912 104.618667 287.786666-361.130667z"/></svg>`,
  summary: `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="3.1" y="2.2" width="9.8" height="11.6" rx="2.3" stroke="currentColor" stroke-width="1.4"/><path d="M5.8 6.1h4.4M5.8 9.7h2.9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  calendar: `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2.3" y="3.6" width="11.4" height="10" rx="2.6" stroke="currentColor" stroke-width="1.4"/><path d="M2.3 6.9h11.4M5.8 2.4v2.3M10.2 2.4v2.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`,
  check: `<svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6.9" fill="currentColor"/><path d="m5 8.2 2 2 4-4.2" stroke="var(--wb-on-accent)" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  chevron: `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="m3.6 6.2 4.4 4.4 4.4-4.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  archive: `<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true"><rect x="2.4" y="3" width="11.2" height="3.1" rx="1" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/><path d="M3.5 6.1v5.4a1.4 1.4 0 0 0 1.4 1.4h6.2a1.4 1.4 0 0 0 1.4-1.4V6.1" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 8.2v3.4M6.5 10.1L8 11.6l1.5-1.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  empty: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4.5" width="18" height="15" rx="4" stroke="currentColor" stroke-width="1.3"/><path d="M3 9.5h18M7.5 14h7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
}

/** One card, in the states the component can draw. */
function card({ status = 'open', title, desc, tag = '', time = '刚刚', archived = false, fill = true, pending = false, open = false, empty = false, long = false }) {
  const done = status === 'done'
  const busy = status === 'in_progress'
  return `
  <li class="${cls('card', done && 'cardDone', archived && 'cardArchived')}">
    <div class="${cls('cardHead')}">
      <span class="${cls('mark', done && 'markDone', busy && 'markBusy')}"><span class="${cls('markDot')}"></span></span>
      <div class="${cls('cardBody')}">
        <div class="${cls('titleRow')}">
          <button type="button" class="${cls('titleText')}">${title}</button>
          ${done ? `<span class="${cls('statusPill', 'statusPillDone')}">${icon.check}已完成</span>` : ''}
          ${busy ? `<span class="${cls('statusPill', 'statusPillBusy')}"><span class="${cls('statusPip')}"></span>进行中</span>` : ''}
          ${archived ? `<span class="${cls('archivedBadge')}">已归档</span>` : ''}
        </div>
        <button type="button" class="${cls('descText')}">${desc}</button>
        <div class="${cls('metaRow')}">
          ${icon.calendar}
          <span class="${cls('metaLabel')}">项目：</span>
          <button type="button" class="${tag === '' ? cls('tag', 'tagEmpty') : cls('tag')}">${tag === '' ? '+ 标签' : tag}</button>
          <span class="${cls('metaSpacer')}"></span>
          <span class="${cls('time')}">${time}</span>
        </div>
        <div class="${cls('cardFoot')}">
          ${fill ? `<button type="button" class="${cls('primaryBtn')}">${icon.send}<span>发送</span></button>` : ''}
          ${done ? '' : `<button type="button" class="${cls('ghostBtn', busy && 'ghostBtnBusy', pending && 'ghostBtnPending')}">${icon.summary}<span>总结</span></button>`}
          <span class="${cls('footSpacer')}"></span>
          <button type="button" class="${cls(archived ? ['archiveBtn', 'archiveBtnOn'] : ['archiveBtn'])}">
            ${icon.archive}<span>${archived ? '取消归档' : '归档'}</span>
          </button>
          <span class="${cls('cardActions')}">
            <button type="button" class="${cls(open ? ['chevron', 'chevronOpen'] : ['chevron'])}">
              ${icon.chevron}<span>${open ? '收起详情' : '展开详情'}</span>
            </button>
          </span>
        </div>
      </div>
    </div>
    <div class="${cls(open ? ['detailWrap', 'detailOpen'] : ['detailWrap'])}">
      <div class="${cls('detail')}">
        <div class="${cls('completionDivider')}">待办总结</div>
        ${empty
    ? `<div class="${cls('detailEmpty')}">${icon.empty}</div>`
    : `${long
      ? Array.from({ length: 9 }, (_, i) => `<p class="${cls('completionSummary')}">${i + 1}. 这一段只是把摘要撑到超过展开区的限高，用来看滚动条是不是一直在。</p>`).join('')
      : `<p class="${cls('completionSummary')}">整理官网改版的需求边界，输出方案初稿：信息架构、页面清单与两周排期。</p>`}
        <div class="${cls('completionBlock')}">
          <p class="${cls('completionBlockTitle')}">实现路径</p>
          <ol class="${cls('completionSteps')}"><li>梳理现有导航与页面清单</li><li>产出方案初稿并评审</li></ol>
        </div>`}
      </div>
    </div>
  </li>`
}

const tokens = {
  light: `
    --dsw-alias-bg-base: #ffffff;
    --dsw-alias-bg-layer-1: #f6f6f7;
    --dsw-alias-bg-layer-2: #ededf0;
    --dsw-alias-border-l1: rgba(0,0,0,.055);
    --dsw-alias-border-l2: rgba(0,0,0,.09);
    --dsw-alias-label-primary: #17171a;
    --dsw-alias-label-secondary: #4d4d55;
    --dsw-alias-brand-primary: #2b6cf5;
    --dsw-alias-state-success-primary: #12a05c;
    --dsw-alias-state-idle-primary: #8e8e98;
    --dsw-alias-interactive-bg-hover: rgba(0,0,0,.045);
    --dsw-specific-sidebar-fill: #f2f3f5;
  `,
  dark: `
    --dsw-alias-bg-base: #1c1c1f;
    --dsw-alias-bg-layer-1: #242429;
    --dsw-alias-bg-layer-2: #161618;
    --dsw-alias-border-l1: rgba(255,255,255,.055);
    --dsw-alias-border-l2: rgba(255,255,255,.09);
    --dsw-alias-label-primary: #f0f0f3;
    --dsw-alias-label-secondary: #ababb5;
    --dsw-alias-brand-primary: #5b8cff;
    --dsw-alias-state-success-primary: #32c07a;
    --dsw-alias-state-idle-primary: #7f7f8b;
    --dsw-alias-interactive-bg-hover: rgba(255,255,255,.06);
    --dsw-specific-sidebar-fill: #1a1a1d;
  `,
}

const cards = card({
  status: 'done',
  title: '完成项目方案初稿',
  desc: '整理项目需求，完成方案初稿，包含整体思路、功能规划与时间安排。',
  tag: '产品官网改版',
})

const busy = card({
  status: 'in_progress',
  title: '给工作台卡片换成参考图的设计',
  desc: '标题加粗、状态胶囊、项目行、底部动作行；浅色和深色都要成立。',
  tag: 'DSH 插件',
  time: '12 分钟前',
})

const openCards = card({
  title: '验收右侧栏折叠后的排布',
  desc: '',
  tag: '',
  time: '3 小时前',
  open: true,
  empty: true,
}) + card({
  status: 'in_progress',
  title: '把写回提示并入展开区',
  desc: '写回请求已发出，等模型返回结构化总结。',
  tag: '写回',
  time: '昨天',
  pending: true,
  open: true,
})

/** The new-item card, as `WorkbenchTab.tsx` draws it while `editing.kind === 'create'`. */
const composer = `
  <li class="${cls('card', 'cardComposing')}">
    <div class="${cls('cardHead')}">
      <span class="${cls('mark', 'markBusy')}"><span class="${cls('markDot')}"></span></span>
      <div class="${cls('cardBody')}">
        <input class="${cls('field', 'fieldTitle')}" placeholder="新的待办…" value="">
        <p class="${cls('editHint')}">回车创建，Esc 取消</p>
      </div>
    </div>
  </li>`

/** An archived item: the same card, filed away and offering the way back. */
const archived = card({
  title: '旧版导航的方案存档',
  desc: '已被新版替代，留作记录。',
  tag: '产品官网改版',
  time: '上周',
  archived: true,
})

/** A summary that overflows the cap: the expanded area's own scrollbar, always drawn. */
const scrolled = card({
  status: 'done',
  title: '长总结的展开区',
  desc: '摘要超过限高，展开区自己滚。',
  tag: 'DSH 插件',
  time: '昨天',
  open: true,
  long: true,
})

/** The filter row: the four tiers, with one of them optionally current. */
const chips = (active = '') => `<div class="${cls('toolbar')}">
  <div class="${cls('filterRow')}" style="margin-top:0">
    ${[
    ['全部', 9, 'all'],
    ['未完成', 4, 'active'],
    ['已完成', 5, 'done'],
    ['已归档', 2, 'archived'],
  ].map(([label, count, tier]) => `<button type="button" class="${cls('chip',
    tier === 'done' && 'chipDone',
    tier === 'archived' && 'chipArchived',
    tier === active && 'chipActive')}">${label}<span class="${cls('chipCount')}">${count}</span></button>`).join('')}
  </div>
</div>`

const column = (body, theme, width = 380, height = 420, head = '') => `
  <section class="col" data-theme="${theme}" style="width:${width + 32}px">
    <p class="colTitle">${theme === 'light' ? '浅色' : '深色'} · 面板 ${width}px</p>
    <div class="${cls('pane')}" style="height:${height}px">
      ${head}
      <div class="${cls('scroller')}">
        <ul class="${cls('list')}">${body}</ul>
      </div>
    </div>
  </section>`

const html = `<!doctype html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<title>workbench card preview</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 28px; background: #fbfbfc; font: 14px/1.5 system-ui, "PingFang SC", "Microsoft YaHei", sans-serif; }
  .cols { display: flex; gap: 28px; align-items: flex-start; flex-wrap: wrap; }
  .col { width: 380px; padding: 16px; border-radius: 18px; }
  .col[data-theme="light"] { ${tokens.light} background: var(--dsw-specific-sidebar-fill); }
  .col[data-theme="dark"] { ${tokens.dark} background: var(--dsw-specific-sidebar-fill); }
  .colTitle { margin: 0 0 12px; color: var(--dsw-alias-label-secondary); font-size: 12px; }
  ${stylesheet}
</style>
</head>
<body>
  <div class="cols">
    ${column(cards + scrolled, 'light', 380, 620)}
    ${column(composer + busy + openCards + archived, 'light', 380, 860)}
    ${column(composer + cards + busy, 'dark', 380, 620)}
  </div>
  <div class="cols" style="margin-top:24px">
    ${column('', 'light', 380, 120, chips(''))}
    ${column('', 'light', 380, 120, chips('done'))}
    ${column('', 'dark', 380, 120, chips('archived'))}
  </div>
  <div class="cols" style="margin-top:24px">
    ${column(busy, 'light', 320)}
    ${column(busy, 'light', 280)}
    ${column(busy, 'dark', 320)}
  </div>
</body>
</html>
`

writeFileSync(OUT, html)
console.log(`wrote ${OUT} (${html.length} bytes, ${Object.keys(css).length} module classes)`)
