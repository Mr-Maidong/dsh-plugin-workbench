/**
 * Host pass: bundle the tsc-emitted Node half into `lib/index.js`, plus the two
 * hand-maintained Typert artifacts into `lib/typert.host.js` and
 * `lib/typert.remote-client.js`.
 *
 * This config does NOT run `@deepseek-ai/dsh-typert-generator`, and that is a
 * deliberate, load-bearing decision.
 *
 * Why not: the generator cannot recognize a `@Remote` method outside the DSH
 * monorepo. Its `isTypeMetaSymbol` requires the protocol's declaration to belong
 * to a package registered in the analysis workspace — physically under this
 * repository's `packages/` — or to sit inside an ambient
 * `declare module '@deepseek-ai/dsh-typert-protocol'`. A standalone plugin
 * resolves the protocol from `node_modules`, so neither holds; it collects zero
 * invocations and fails the build with "publishes Remote artifacts but has no
 * Remote methods". Verified on generator 0.2.0-rc.2 and 0.2.1-alpha.2, and
 * reproduced on the reference plugin `dsh-mcp-mcp-status`, whose committed
 * artifacts still install and run — installing consumes them, it never
 * regenerates them.
 *
 * What we would lose by dropping it, and why nothing is lost: the plugin's
 * `transform` hook lowers standard decorators, but it only matches `\.[cm]?tsx?`
 * sources and every entry here is already a tsc-emitted `.js` file — and `tsc`
 * lowers standard decorators itself. `lib/types/index.js` already contains the
 * `__esDecorate` helper, and `lib/index.js` carries it through the bundle. So
 * `WorkbenchService` is executable without the plugin. Reinstating it for that
 * reason would couple the build to `hasTypertExport()`, a third-party gate that
 * reads this build package's own `exports` field, for no benefit.
 *
 * The contract the generator would have emitted is maintained by hand in
 * `src/typert.contract.ts`, declared once and projected into both faces;
 * `tests/remote-contract.spec.ts` fails if it drifts from the service.
 *
 * The entries share one outDir and `clean` stays false, because the tsc output
 * under `lib/types` and these bundles live together.
 *
 * `fuzzy` is its own entry because it is pure and host-only: `tests/fuzzy.spec.ts`
 * scores the shipped artifact directly, and pulling it in through `lib/index.js`
 * would drag the storage domain, the workspace registry, and the cordis service
 * machinery into a test that needs none of them. `state` — the write-back state
 * machine of §4.5 — is the second such entry for the same reason: its three edges
 * are the rule the whole completion path rests on, and they are worth asserting
 * without a storage domain standing behind them.
 */
import { defineConfig } from 'tsdown'
import { nodeLibrary } from './tsdown.client.ts'

export default defineConfig(nodeLibrary('dsh-plugin-workbench', [
  'lib/types/index.js',
  'lib/types/fuzzy.js',
  'lib/types/state.js',
  'lib/types/typert.host.js',
  'lib/types/typert.remote-client.js',
]))
