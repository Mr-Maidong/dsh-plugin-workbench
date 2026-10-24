/**
 * The list scrollbar's inset (§9.45).
 *
 * The bar used to sit flush against the pane's right and bottom edges, which read
 * as a cut-off edge rather than a control inside the panel. The 6px margin moves
 * the scrollport in; the matching drops in padding-right and padding-bottom keep
 * every card at the width and bottom air it had before. Both halves of that pair
 * are asserted, because editing either one alone silently moves the cards.
 *
 * Runs against `src/` like the other stylesheet specs: no imports beyond `node:*`.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

/** Comments are stripped first: they contain braces and semicolons. */
const css = readFileSync(new URL('../src/client/WorkbenchTab.module.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')

/** Every declaration of one rule, keyed by property. */
function rule(selector: string): Record<string, string> {
  const at = css.indexOf(`\n${selector} {`)
  assert.notEqual(at, -1, `${selector} has no rule`)
  const body = css.slice(css.indexOf('{', at) + 1, css.indexOf('}', at))
  const out: Record<string, string> = {}
  for (const declaration of body.split(';')) {
    const colon = declaration.indexOf(':')
    if (colon > 0) out[declaration.slice(0, colon).trim()] = declaration.slice(colon + 1).trim()
  }
  return out
}

describe('the list scroller is inset from the pane and fades at its edges', () => {
  it('holds the bar 6px off the right and bottom, and pays for it in padding', () => {
    const scroller = rule('.scroller')
    // top right bottom left — 6px on the two edges the user sees the bar touch.
    assert.equal(scroller.margin, '0 6px 6px 0')
    // The right and bottom padding each drop 6px (14 -> 8, 24 -> 18), so the
    // card's box does not move: margin + padding still sums to 20 right, 24 bottom.
    assert.equal(scroller.padding, '14px 8px 18px 14px')
    assert.equal(scroller['scrollbar-gutter'], 'stable')
    assert.equal(scroller.overflow, 'auto')
  })

  it('fades both ends across exactly the padding, so cards never start translucent', () => {
    const mask = (rule('.scroller')['mask-image'] ?? '').replace(/\s+/g, ' ')
    assert.match(
      mask,
      /^linear-gradient\(\s*to bottom,\s*transparent 0,\s*#000 14px,\s*#000 calc\(100% - 18px\),\s*transparent 100%\s*\)$/,
    )
  })
})
