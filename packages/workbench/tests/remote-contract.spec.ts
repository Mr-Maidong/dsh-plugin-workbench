/**
 * The safety net for the hand-maintained Typert artifacts.
 *
 * `src/typert.contract.ts` restates the Host's Remote surface by hand because
 * the Typert generator cannot analyze a plugin outside the DSH monorepo. The
 * cost of restating is drift: a `@Remote` method added to `WorkbenchService`
 * without a matching descriptor would build cleanly and then fail at runtime,
 * in a browser, with no compile-time signal. This test removes that failure
 * mode, and it is the reason the hand-written approach is safe to take.
 *
 * It runs against the BUILT artifacts, not the sources — deliberately:
 *
 *  - `src/index.ts` contains standard decorators, which Node cannot execute, so
 *    the sources are not importable here at all.
 *  - `lib/index.js` is what DSH actually loads and `lib/typert.*.js` is what the
 *    loader and the browser half actually consume. Asserting on those checks the
 *    contract as shipped, including that the two faces were bundled from the
 *    same declaration and survived the build.
 *
 * Three parties must agree, and this is where they are compared:
 *
 *  1. `remoteMethods()` — markers the protocol attached to the live class
 *     prototype. This is the service surface, read from the service itself.
 *  2. `TYPERT.invocations` — the Host contribution.
 *  3. `TYPERT_REMOTE.descriptors` — the Client artifact the browser mounts.
 *
 * Runs on Node's built-in runner (`pnpm test`) so the check adds no test
 * dependency to a package whose whole point is to stay installable on its own.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { remoteMethods } from '@deepseek-ai/dsh-typert-protocol'
import WorkbenchService from '../lib/index.js'
import { TYPERT } from '../lib/typert.host.js'
import { TYPERT_REMOTE } from '../lib/typert.remote-client.js'

const SERVICE_KEY = 'workbench'

/** The methods P1 publishes. Kept explicit so a silently dropped endpoint fails here. */
const EXPECTED_METHODS = ['probe', 'search', 'create', 'setDesc', 'update', 'requestComplete', 'delete']

/** Methods that take no argument beyond the caller's context. */
const PARAMETERLESS = new Set(['probe'])

/**
 * A Service and not just a prototype, because the protocol records Remote
 * markers from an `addInitializer` callback, which tsc emits as
 * `__runInitializers(this, ...)` inside the constructor. A bare
 * `Object.create(prototype)` never runs it, so `remoteMethods` would report an
 * empty surface for a class that has one. `remoteMethods` documents a "live
 * Service instance" for exactly this reason.
 *
 * The constructor needs three things, and stubbing them keeps this test about
 * the declared surface rather than about storage: `super(ctx, 'workbench')`
 * reaches `ctx.reflect.provide` through Cordis, `bindTypertRemote` only validates
 * names and skips its Context-dependent branch for a non-Context, and the domain
 * open is awaited by the methods but never by construction. `workspaceRegistry`
 * is read only by the write methods, which this test does not call — its absence
 * from the stub is deliberate, not an oversight.
 */
const stubContext = {
  reflect: { provide: () => {} },
  // A real Context reaches optional Services through `inject`; without this the
  // constructor's `tools` injection would throw before the decorators are read.
  // This double never runs the callback and has no registry to run it against,
  // because this test asserts the declared surface, not the tool.
  inject: () => {},
  effect: () => {},
  storageDomain: {
    open: () => Promise.resolve({
      name: SERVICE_KEY,
      table: () => ({ size: 0 }),
    }),
  },
}

/** Constructed to run the decorator initializers; not otherwise exercised. */
const service = new WorkbenchService(
  stubContext as unknown as ConstructorParameters<typeof WorkbenchService>[0],
)

const markers = remoteMethods(service)
const endpointName = (marker: { method: string, exportName?: string }): string => marker.exportName ?? marker.method

/** What the service actually exposes. */
const exposed = markers.map(endpointName)

/** Look one descriptor up by method, failing loudly rather than returning undefined. */
function descriptorOf(method: string) {
  const found = TYPERT_REMOTE.descriptors.find(candidate => candidate.method === method)
  assert.ok(found, `no descriptor for ${method}`)
  return found
}

describe('Remote contract', () => {
  it('publishes the same endpoints on both faces', () => {
    assert.equal(TYPERT.package, 'dsh-plugin-workbench')
    assert.equal(TYPERT_REMOTE.package, 'dsh-plugin-workbench')
    assert.deepEqual(
      TYPERT.invocations.map(d => d.id),
      TYPERT_REMOTE.descriptors.map(d => d.id),
    )
  })

  it('exposes exactly the methods the contract describes', () => {
    assert.ok(exposed.length > 0, 'no @Remote markers were recorded on the prototype')
    assert.deepEqual([...exposed].sort(), [...EXPECTED_METHODS].sort())
    assert.deepEqual([...exposed].sort(), TYPERT_REMOTE.descriptors.map(d => d.method).sort())
  })

  it('routes every method under one service key and namespace', () => {
    for (const descriptor of TYPERT_REMOTE.descriptors) {
      assert.equal(descriptor.service, SERVICE_KEY)
      assert.equal(descriptor.namespace, SERVICE_KEY)
      assert.equal(descriptor.id, `dsh-plugin-workbench#${SERVICE_KEY}/${descriptor.method}`)
      assert.equal(descriptor.mode, undefined, `${descriptor.method} must not be a stream`)
      assert.equal(typeof service[descriptor.method], 'function')
    }
  })

  it('matches each descriptor to a real decorator marker', () => {
    for (const descriptor of TYPERT_REMOTE.descriptors) {
      const marker = markers.find(candidate => endpointName(candidate) === descriptor.method)
      assert.ok(marker, `no @Remote marker for ${descriptor.method}`)
      assert.deepEqual(descriptor.invocation, marker.invocation)
    }
  })

  it('declares one JSON request parameter per method that takes one', () => {
    for (const descriptor of TYPERT_REMOTE.descriptors) {
      if (PARAMETERLESS.has(descriptor.method)) {
        assert.deepEqual(descriptor.parameters, [], `${descriptor.method} takes no parameters`)
        continue
      }
      // A method that grows a parameter must grow a parameter descriptor in the
      // same commit, or the client will send a field the Host never declared.
      assert.equal(descriptor.parameters.length, 1, `${descriptor.method} takes one request object`)
      const [request] = descriptor.parameters
      assert.equal(request?.name, 'request')
      assert.equal(request?.wire, 'request')
      assert.equal(request?.source, 'json')
      assert.equal(request?.codec.mode, 'strict')
    }
  })

  it('names every boundary type after this package', () => {
    for (const descriptor of TYPERT_REMOTE.descriptors) {
      assert.match(descriptor.result.typeSymbol, /^dsh-plugin-workbench\/types#/)
      for (const request of descriptor.parameters) {
        assert.match(request.codec.typeSymbol, /^dsh-plugin-workbench\/types#/)
      }
    }
  })

  it('validates a well-formed probe result and rejects a malformed one', () => {
    const codec = descriptorOf('probe').result
    const schema = codec.create()
    assert.deepEqual(schema.parse({ domain: 'workbench', itemCount: 0 }), { domain: 'workbench', itemCount: 0 })
    assert.throws(() => schema.parse({ domain: 'workbench', itemCount: -1 }))
    assert.throws(() => schema.parse({ domain: 'workbench' }))
  })

  it('accepts an empty search request and rejects out-of-range paging', () => {
    const schema = descriptorOf('search').parameters[0]?.codec.create()
    assert.ok(schema)
    assert.deepEqual(schema.parse({}), {})
    assert.deepEqual(schema.parse({ query: 'wbn', limit: 10 }), { query: 'wbn', limit: 10 })
    assert.throws(() => schema.parse({ offset: -1 }))
    assert.throws(() => schema.parse({ limit: 0 }))
    assert.throws(() => schema.parse({ status: ['archived'] }), 'archived is not a status')
  })

  it('carries all four tier counts through the search result', () => {
    const schema = descriptorOf('search').result.create()
    const counts = { all: 3, active: 2, done: 1, archived: 4 }
    const page = { items: [], total: 0, counts }
    assert.deepEqual(schema.parse(page), page)
    // The filter row prints these, so a Host that stopped sending them has to
    // fail here rather than have zod strip the field and render `undefined`.
    assert.throws(() => schema.parse({ items: [], total: 0 }))
    assert.throws(() => schema.parse({ items: [], total: 0, counts: { all: 3, active: 2, done: 1 } }))
    assert.throws(() => schema.parse({ items: [], total: 0, counts: { ...counts, done: -1 } }))
  })

  it('requires a workspace and title to create', () => {
    const schema = descriptorOf('create').parameters[0]?.codec.create()
    assert.ok(schema)
    assert.throws(() => schema.parse({ title: 'no workspace' }))
    assert.throws(() => schema.parse({ workspaceId: 'w' }))
    assert.deepEqual(schema.parse({ workspaceId: 'w', title: 't' }), { workspaceId: 'w', title: 't' })
  })

  it('carries a completion through the write union only when it is well formed', () => {
    // The browser decodes the RESULT UNION, not a bare record: `create` answers
    // with `{ code: 'ok', item }`. So the union is the envelope under test, and
    // the record's own rules have to hold inside it.
    const schema = descriptorOf('create').result.create()
    const item = {
      id: 'id', workspaceId: 'w', workspacePath: '/w', title: 't', desc: '', tag: '',
      status: 'done', archived: false, updateAt: '2024-01-01T00:00:00.000Z', createdAt: '2024-01-01T00:00:00.000Z',
      completion: {
        summary: 's', implementationPath: ['a'], changedFiles: [{ path: 'a', purpose: 'p' }],
        verification: [{ command: 'c', result: 'passed' }],
        completedAt: '2024-01-01T00:00:00.000Z', completedBy: 'model',
      },
    }
    assert.deepEqual(schema.parse({ code: 'ok', item }), { code: 'ok', item })
    assert.throws(() => schema.parse({ code: 'ok', item: { ...item, status: 'not-a-status' } }))
    assert.throws(() => schema.parse({ code: 'ok', item: { ...item, completion: { summary: 's' } } }))

    const withoutId: Record<string, unknown> = { ...item }
    delete withoutId.id
    assert.throws(() => schema.parse({ code: 'ok', item: withoutId }), 'the id is required')

    // `archivedAt` is optional and the wire schema does not cross-check it
    // against `archived`; that pairing is `storage.ts`'s job, not the boundary's.
    const archived = { ...item, archived: true, archivedAt: '2024-01-01T00:00:00.000Z' }
    assert.deepEqual(schema.parse({ code: 'ok', item: archived }), { code: 'ok', item: archived })
  })

  it('keeps the delete result union strictly narrower than the write union', () => {
    // A delete cannot fail validation the way a write can, so `invalid` must not
    // leak into its union — a client matching on it would be handling a case
    // that never arrives.
    const write = descriptorOf('create').result.create()
    const remove = descriptorOf('delete').result.create()

    const id = 'id'
    assert.deepEqual(remove.parse({ code: 'ok', id }), { code: 'ok', id })
    assert.deepEqual(remove.parse({ code: 'not_found', id }), { code: 'not_found', id })
    assert.throws(() => remove.parse({ code: 'invalid', message: 'nope' }))
    assert.deepEqual(write.parse({ code: 'invalid', message: 'nope' }), { code: 'invalid', message: 'nope' })

    // Both unions reject a code neither declares.
    assert.throws(() => write.parse({ code: 'maybe' }))
    assert.throws(() => remove.parse({ code: 'maybe' }))
  })

  it('strips unknown wire fields instead of rejecting them', () => {
    // The wire boundary is deliberately tolerant while stored records are
    // `.strict()` in `storage.ts`: a plugin version skew should not make a call
    // fail, but a corrupt on-disk record must be noticed. This asserts the wire
    // half of that split, which is the half that looks like an omission.
    const schema = descriptorOf('search').parameters[0]?.codec.create()
    assert.ok(schema)
    assert.deepEqual(schema.parse({ query: 'a', fromTheFuture: true }), { query: 'a' })
  })

  /*
   * The hand-written TYPE surfaces, checked as text.
   *
   * A `declare module` block and a diagnostic `types` entry are both erased at
   * runtime, so nothing above can see them — and yet both are hand-maintained
   * copies of the same contract. A rename would leave them stale while every
   * runtime assertion still passed: `mount.ts` would compile against a namespace
   * member that `INVOCATIONS` never publishes and fail only in a browser, which is
   * precisely the failure mode this file exists to prevent. A type cannot be
   * asserted on from a value, so these two tests read the sources instead, and
   * that is all they claim to do.
   */
  it('declares exactly the published methods in the client Remote namespace', () => {
    const source = readFileSync(new URL('../src/typert.remote-client.ts', import.meta.url), 'utf8')
    assert.deepEqual(
      memberNames(interfaceBody(source, 'TypertRemoteNamespace$776f726b62656e63')),
      sortedExpected(),
    )
    assert.deepEqual(qualifiedNames(interfaceBody(source, 'TypertRemoteMap')), sortedExpected())
  })

  it('names every published method in the host diagnostic surface', () => {
    const source = readFileSync(new URL('../src/typert.host.ts', import.meta.url), 'utf8')
    const named = [...source.matchAll(/^\s+name: '(\w+)',$/gm)]
      .map(match => match[1] ?? '')
      .filter(name => EXPECTED_METHODS.includes(name))
    assert.deepEqual([...named].sort(), sortedExpected())
  })

  it('labels every host diagnostic type entry with the name it declares', () => {
    // The list is prose for humans — nothing validates it — so a mismatched pair
    // is invisible except by reading it. This is the test that catches it.
    const lines = readFileSync(new URL('../src/typert.host.ts', import.meta.url), 'utf8').split('\n')
    const pairs = lines.flatMap((line, index) => {
      const label = /^\s+name: '([\w$]+)',$/.exec(line)
      if (label === null) return []
      const declared = /^\s+declaration: ['"`]export (?:type|interface) ([\w$]+)/.exec(lines[index + 1] ?? '')
      return declared === null ? [] : [{ label: label[1] ?? '', declared: declared[1] ?? '' }]
    })
    assert.ok(pairs.length >= EXPECTED_METHODS.length, 'expected the diagnostic type list to be non-trivial')
    for (const pair of pairs) {
      assert.equal(pair.label, pair.declared, `type entry '${pair.label}' declares '${pair.declared}'`)
    }
  })

  it('nests the model where the 0.2.1-rc.2 loader looks for it', () => {
    // rc.2 validates `model.services/events/objects`. The older flat shape built
    // cleanly, installed cleanly, and then aborted the whole Host boot with
    // "typert-loader: dsh-plugin-workbench TYPERT.model must be an object" —
    // which surfaced to the desktop shell as `desktop welcome: Web RPC failed`
    // (DESIGN §9.29). Nothing type-checks this manifest: the loader reads it at
    // runtime from the built artifact, so only a test can hold the shape.
    const manifest = TYPERT as unknown as Record<string, unknown>
    assert.equal(manifest.package, 'dsh-plugin-workbench')
    assert.equal(manifest.face, 'host')
    assert.ok(Array.isArray(manifest.schemas))
    assert.ok(Array.isArray(manifest.invocations))
    const model = manifest.model
    assert.ok(typeof model === 'object' && model !== null && !Array.isArray(model), 'TYPERT.model must be an object')
    const { services, events, objects } = model as Record<string, unknown>
    for (const [label, value] of [['services', services], ['events', events], ['objects', objects]] as const) {
      assert.ok(Array.isArray(value), `TYPERT.model.${label} must be an array`)
    }
    assert.equal((services as readonly unknown[]).length, 1, 'the Host publishes exactly one service')
    for (const value of services as readonly Record<string, unknown>[]) {
      assert.ok(Array.isArray(value.tags), 'a service owes tags: [] — the loader checks it first')
      assert.ok(Array.isArray(value.members))
      assert.ok(Array.isArray(value.types))
      assert.equal(typeof value.key, 'string')
      assert.equal(typeof value.exportName, 'string')
    }
    for (const key of ['services', 'events', 'objects']) {
      assert.equal(manifest[key], undefined, `TYPERT.${key} must not sit at the top level`)
    }
  })
})

/**
 * The text between an interface's braces.
 * @param source - the whole file.
 * @param name - the interface to find.
 * @returns its body, exclusive of the braces.
 */
function interfaceBody(source: string, name: string): string {
  const start = source.indexOf(`interface ${name} {`)
  assert.notEqual(start, -1, `interface ${name} is not declared`)
  const open = source.indexOf('{', start)
  let depth = 0
  for (let index = open; index < source.length; index += 1) {
    const char = source[index]
    if (char === '{') depth += 1
    else if (char === '}') {
      depth -= 1
      if (depth === 0) return source.slice(open + 1, index)
    }
  }
  throw new Error(`interface ${name} is never closed`)
}

/**
 * Interface members declared at the artifact's one indent level.
 * @param body - a block from {@link interfaceBody}.
 * @returns the member names, sorted.
 */
function memberNames(body: string): string[] {
  return [...body.matchAll(/^\s{4}(\w+):/gm)].map(match => match[1] ?? '').sort()
}

/**
 * Method names from `'workbench/<name>':` keys.
 * @param body - a block from {@link interfaceBody}.
 * @returns the method names, sorted.
 */
function qualifiedNames(body: string): string[] {
  return [...body.matchAll(/'workbench\/(\w+)':/g)].map(match => match[1] ?? '').sort()
}

/** @returns {@link EXPECTED_METHODS} sorted, for comparison against a sorted list. */
function sortedExpected(): string[] {
  return [...EXPECTED_METHODS].sort()
}
