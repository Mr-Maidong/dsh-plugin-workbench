/**
 * The edit fields' boxes: clicking a title, a description or a tag must not move
 * the card (§9.14).
 *
 * The invariant is a *pair* of declarations — each field class restates the
 * metrics of the display element it replaces — so it is asserted on the
 * stylesheet rather than in a browser. A rendered test would only catch the cases
 * someone remembered to render; reading both rules side by side catches the case
 * where one of them is edited alone, which is exactly how a 33px title field and
 * a 62px description field got there: the display said 21px and the field said 33,
 * and nothing compared them.
 *
 * Runs against `src/` like the guardian spec: no imports beyond `node:*`, no
 * bundle, no React.
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

/** A pixel length, or the literal `0`. */
function px(value: string | undefined): number {
  const text = (value ?? '').trim()
  assert.ok(text === '0' || text.endsWith('px'), `${value} is not a pixel length`)
  return Number.parseFloat(text)
}

/** The vertical box a one-line rule draws: borders + the line box + padding. */
function box(declarations: Record<string, string>): number {
  const [verticalPadding] = (declarations['padding'] ?? '0').split(/\s+/)
  const [borderWidth] = (declarations['border'] ?? '0').split(/\s+/)
  return 2 * px(borderWidth) + 2 * px(verticalPadding) + px(declarations['line-height'])
}

/** The left and right padding of a rule, as written. */
function padX(declarations: Record<string, string>): string {
  const parts = (declarations['padding'] ?? '0').split(/\s+/)
  return parts[parts.length === 1 ? 0 : 1] ?? '0'
}

describe('edit fields replace their display element box for box', () => {
  it('keeps the title field on the title line, with no height of its own', () => {
    const text = rule('.titleText')
    const field = rule('.fieldTitle')
    assert.equal(field['font-size'], text['font-size'])
    assert.equal(field['font-weight'], text['font-weight'])
    assert.equal(px(field['line-height']), px(text['line-height']))
    // 21px of line box, and nothing else: a declared height is how the field
    // outgrew the text in the first place.
    assert.ok(!('height' in field), '.fieldTitle must not declare a height')
    assert.equal(box(field), px(text['line-height']))
    // The 4px inset belongs to both states (§9.16); on one side only, the text
    // would move 4px sideways on click. And it must stay horizontal: the display
    // element's height is its line box, nothing more.
    assert.equal(box(text), px(text['line-height']))
    assert.equal(padX(field), padX(text))
    assert.equal(padX(field), '4px')
  })

  it('keeps a finished item\'s title field in the finished item\'s ink', () => {
    const text = rule('.cardDone .titleText')
    const field = rule('.cardDone .fieldTitle')
    assert.equal(field['color'], text['color'])
    assert.equal(field['font-weight'], text['font-weight'])
  })

  it('keeps the description field on the description lines, capped at the clamp', () => {
    const text = rule('.descText')
    const field = rule('.fieldDesc')
    assert.equal(field['font-size'], text['font-size'])
    assert.equal(px(field['line-height']), px(text['line-height']))
    // The display clamps to two lines, so the field may grow to two lines and no
    // further; `overflow-y` turns the rest into a scrollbar instead of a jump.
    assert.equal(px(field['max-height']), 2 * px(text['line-height']))
    assert.equal(field['overflow-y'], 'auto')
    assert.equal(field['resize'], 'none')
    assert.equal(field['margin-top'], (text['margin'] ?? '').split(/\s+/)[0])
    // Same 4px on both sides (§9.16), horizontal only — so the two-line cap and
    // the height the field measures for itself are exactly what they were.
    assert.equal(box(text), px(text['line-height']))
    assert.equal(padX(field), padX(text))
    assert.equal(padX(field), '4px')
  })

  it('measures the description with the line height the stylesheet declares', () => {
    // The layout effect clamps with its own constant (§9.14). If it drifts from
    // `.fieldDesc`'s line-height, an edited description jumps by that much — which
    // is the bug this file exists to prevent — so the two are asserted together.
    const field = rule('.fieldDesc')
    const source = readFileSync(new URL('../src/client/WorkbenchTab.tsx', import.meta.url), 'utf8')
    const height = /const DESC_LINE_HEIGHT = (\d+)/.exec(source)
    const lines = /const DESC_MAX_LINES = (\d+)/.exec(source)
    assert.ok(height, 'DESC_LINE_HEIGHT must stay a literal in WorkbenchTab.tsx')
    assert.ok(lines, 'DESC_MAX_LINES must stay a literal in WorkbenchTab.tsx')
    assert.equal(`${Number(height[1])}px`, field['line-height'])
    assert.equal(`${Number(height[1]) * Number(lines[1])}px`, field['max-height'])
  })

  it('keeps the tag field the same pill as the tag', () => {
    const pill = rule('.tag')
    const field = rule('.fieldTag')
    // The pill's height is its own padding plus a 15px line box plus a 0.5px
    // border that Chromium rounds up to 1px — so the metrics are compared as
    // written, not re-derived.
    for (const property of ['padding', 'border', 'border-radius', 'font-size', 'line-height']) {
      assert.equal(field[property], pill[property], `.fieldTag ${property}`)
    }
    assert.equal(box(field), box(pill))
  })

  it('draws an edit state with no border, no glow and no scale', () => {
    const field = rule('.field')
    assert.equal(field['padding'], '0')
    assert.equal(field['border'], '0')
    assert.equal(field['margin'], '0')
    assert.ok(!('box-shadow' in field), 'the outer glow must stay gone')
    assert.ok((field['background'] ?? '').includes('--wb-hover'), 'the wash is the display state\'s own')
  })
})
