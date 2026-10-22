/**
 * The card's "time since" wording (DESIGN.md §9.16, §9.19).
 *
 * A card's stamp is read at a glance, so its first minute is worded rather than
 * counted: every action re-renders the pane, and a stamp that recounted seconds
 * would appear to tick whenever the user merely clicked around the list. The
 * formatter itself lives in the tab's TSX, which is bundled rather than compiled
 * to an importable module, so what is pinned here is the threshold and its two
 * ends: the words it returns below a minute, and the localized string it is given
 * to return.
 *
 * Runs on Node's built-in runner (`pnpm test`).
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { fileURLToPath } from 'node:url'

/** Read one source file of this package, relative to `tests/`. */
function source(relative: string): string {
  return readFileSync(fileURLToPath(new URL(`../${relative}`, import.meta.url)), 'utf8')
}

describe('card time', () => {
  const tab = source('src/client/WorkbenchTab.tsx')
  const locales = source('src/client/locales.ts')

  it('words the first minute instead of counting it', () => {
    assert.ok(
      tab.includes('if (magnitude < 60) return justNow'),
      'below a minute the stamp must not change on every render',
    )
    assert.ok(
      !tab.includes("RELATIVE.format(seconds, 'second')"),
      'the ticking seconds wording must be gone, not merely bypassed',
    )
  })

  it('takes the wording from the locale namespace', () => {
    assert.ok(tab.includes("relative(item.updateAt, t('card.justNow'))"))
    // Both dictionaries, once each: the en side is typed against the zh keys, so
    // a missing translation is a build error rather than a test failure, but a
    // duplicated key would silently shadow the first one.
    assert.equal(locales.split("'card.justNow'").length - 1, 2, 'defined in both dictionaries')
    assert.ok(locales.includes("'card.justNow': '刚刚'"))
    assert.ok(locales.includes("'card.justNow': 'just now'"))
  })

  it('still counts minutes and coarser once the minute is up', () => {
    assert.ok(tab.includes("if (magnitude < 3600) return RELATIVE.format(Math.round(seconds / 60), 'minute')"))
  })
})
