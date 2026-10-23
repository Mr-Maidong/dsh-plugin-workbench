/**
 * The card's motion: a fold, a spring, and the one curve they share (§9.18).
 *
 * Two things here are easy to undo by accident and hard to see in a diff. The
 * button that discloses the fold must never carry a transform — its rounded
 * hover/press background would rotate with it — so both glyph effects live on the
 * `svg`. And `prefers-reduced-motion` has to keep winning over every transition
 * added later. Both are asserted on the stylesheet.
 *
 * Runs against `src/` like the guardian spec: no imports beyond `node:*`.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

/** Comments are stripped first: they contain braces and semicolons. */
const css = readFileSync(new URL('../src/client/WorkbenchTab.module.css', import.meta.url), 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
const markup = readFileSync(new URL('../src/client/WorkbenchTab.tsx', import.meta.url), 'utf8')

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

/** The text of every `prefers-reduced-motion` block, concatenated. */
function reducedMotion(): string {
  const blocks: string[] = []
  const marker = '@media (prefers-reduced-motion: reduce)'
  for (let at = css.indexOf(marker); at !== -1; at = css.indexOf(marker, at + 1)) {
    let depth = 0
    for (let i = css.indexOf('{', at); i < css.length; i += 1) {
      if (css[i] === '{') depth += 1
      else if (css[i] === '}') {
        depth -= 1
        if (depth === 0) {
          blocks.push(css.slice(at, i + 1))
          break
        }
      }
    }
  }
  assert.ok(blocks.length > 0, 'no prefers-reduced-motion block at all')
  return blocks.join('\n')
}

describe('the card animates its height and its disclosure control', () => {
  it('keeps every motion rule at the top level', () => {
    // A rule inserted at the wrong brace is not a syntax error: it becomes CSS
    // nesting, stops matching, and every other assertion here still passes. That is
    // exactly how the chevron fix first landed inside `.chevronOpen`, as
    // `& .cardActions > .chevron`. Depth, not presence, is what has to be asserted.
    for (const selector of [
      '.detailWrap',
      '.detailOpen',
      '.detailWrap > .detail',
      '.detailOpen > .detail',
      '.chevronOpen svg',
      '.chevron svg',
      '.chevron:active svg',
      '.fieldDesc',
    ]) {
      const at = css.indexOf(`\n${selector} {`)
      assert.notEqual(at, -1, `${selector} has no rule`)
      let depth = 0
      for (let i = 0; i < at; i += 1) {
        if (css[i] === '{') depth += 1
        else if (css[i] === '}') depth -= 1
      }
      assert.equal(depth, 0, `${selector} is nested, so it never matches`)
    }
  })

  it('defines one spring and spends it on every height and rotation change', () => {
    assert.match(rule('.pane')['--wb-jelly'] ?? '', /^cubic-bezier\(/)
    for (const selector of ['.detailWrap', '.detailOpen', '.fieldDesc', '.chevron svg']) {
      assert.ok((rule(selector)['transition'] ?? '').includes('var(--wb-jelly)'), `${selector} transition`)
    }
  })

  it('folds the expanded region through a grid row, capped and clipped', () => {
    const wrap = rule('.detailWrap')
    assert.equal(wrap['display'], 'grid')
    assert.equal(wrap['grid-template-rows'], '0fr')
    assert.ok((wrap['transition'] ?? '').includes('grid-template-rows'), 'the row is what transitions')
    assert.equal(rule('.detailOpen')['grid-template-rows'], '1fr')
    assert.equal(rule('.detailWrap > .detail')['overflow'], 'hidden')
  })

  it('caps the fold at every style, so collapsing cannot start taller (§9.27)', () => {
    // The cap must sit on the always-matching rule: on the open rule it leaves
    // with the class at the closing instant, and the row's interpolated start
    // point jumps to the uncapped content height — the card grows a beat before
    // it folds, and the list scrollbar flickers.
    assert.equal(rule('.detailWrap > .detail')['max-height'], '50cqh')
    assert.ok(!('max-height' in rule('.detailOpen > .detail')), 'the cap must not leave with the class')
  })

  it('folds to zero: the region padding lives inside, not on the grid item', () => {
    // A padded grid item still stands as tall as its padding under `0fr`, so the
    // collapsed card carried an 8px strip under its content. The padding moved to
    // an inner block, which the fold clips along with everything else.
    assert.equal(rule('.detail')['padding'], '0')
    assert.equal(rule('.detailBody')['padding'], '6px 0 2px')
    assert.ok(markup.includes('css.detailBody'), 'the padded block is the inner one')
  })

  it('keeps a collapsed card out of the tab order without unmounting it', () => {
    // `visibility`, not `display` and not unmounting: the fold needs a live subtree,
    // and an invisible delete button must not stay focusable behind it.
    assert.equal(rule('.detailWrap > .detail')['visibility'], 'hidden')
    assert.equal(rule('.detailOpen > .detail')['visibility'], 'visible')
    assert.ok(markup.includes('css.detailWrap'), 'the fold must be rendered, not conditional')
    assert.ok(!markup.includes('{open && ('), 'the region must not unmount')
  })

  it('rotates the glyph, never the button that carries the hover background', () => {
    // A transform on the button takes its rounded hover/press background with it,
    // so the square visibly spins during the sweep. The rotation therefore lives on
    // the glyph, and the button is left with colour and opacity alone.
    //
    // §9.30: the chevron now points down when the card is closed — it sits beside
    // the words 展开详情, and the direction has to agree with the label — so the
    // open state turns it all the way over to point up.
    assert.equal(rule('.chevronOpen svg')['rotate'], '180deg')
    assert.equal(rule('.chevron:active svg')['scale'], '0.82')
    assert.ok(!css.includes('\n.chevronOpen {'), 'the button itself must stay unrotated')
    for (const selector of ['.chevron']) {
      assert.ok(!('transform' in rule(selector)), `${selector} must not transform`)
      assert.ok(!(rule(selector)['transition'] ?? '').includes('transform'), `${selector} transition`)
    }
  })

  it('switches all of it off when the reader asks for less motion', () => {
    const reduced = reducedMotion()
    const off = new Set(
      [...reduced.matchAll(/([^{}]+)\{\s*transition:\s*none;/g)]
        .flatMap((match) => (match[1] ?? '').split(','))
        .map((selector) => selector.trim())
        .filter(Boolean),
    )
    for (const selector of ['.chevron svg', '.detailWrap', '.detailWrap > .detail', '.fieldDesc']) {
      assert.ok(off.has(selector), `${selector} still moves`)
    }
    assert.match(reduced, /\.chevron:active svg\s*\{\s*scale:\s*none/)
  })
})
