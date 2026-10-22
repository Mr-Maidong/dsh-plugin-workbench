/**
 * Browser pass: bundle the tsc-emitted browser half
 * (`lib/types/client/index.js`) into the closure-factory artifact
 * `packages/workbench/lib/client.js` that the client module registry registers
 * under the package name `dsh-plugin-workbench`.
 *
 * The Remote contribution is bound explicitly instead of through a package
 * self-reference, so the bundle never depends on the module resolver
 * implementing self-referencing exports. That artifact is hand-maintained (see
 * `src/typert.contract.ts`) and is emitted by the host pass, so this pass runs
 * after it.
 */
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'tsdown'
import { clientBundle } from './tsdown.client.ts'

export default defineConfig(clientBundle('dsh-plugin-workbench', 'lib/types/client/index.js', {
  alias: {
    // Both go straight to files the host pass emitted, never through a package
    // self-reference, so the bundle does not depend on the module resolver
    // implementing self-referencing exports. `types` is imported type-only and
    // should be erased before resolution; aliasing it anyway keeps a stray
    // value import from turning into an unresolvable-specifier build error.
    'dsh-plugin-workbench/remote': fileURLToPath(new URL('./packages/workbench/lib/typert.remote-client.js', import.meta.url)),
    'dsh-plugin-workbench/types': fileURLToPath(new URL('./packages/workbench/lib/types/types.js', import.meta.url)),
  },
}))
