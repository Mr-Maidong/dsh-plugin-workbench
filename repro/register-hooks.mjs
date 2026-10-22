/**
 * Node `module.registerHooks` for the harness (Node 24 runs these in-thread and
 * synchronously, which sidesteps the flaky `--loader` worker entirely).
 *
 * Two shims:
 * 1. `*.module.css` imports in the compiled client modules resolve to a class-map
 *    stub — jsdom ignores styles, and only the *identity* of the snapshot store
 *    is what this reproduction observes.
 * 2. `react` and `react/jsx-runtime` must resolve to the one copy the desktop
 *    build uses (`apps/web/node_modules`): the plugin's node_modules has its own
 *    18.3.1, and two Reacts in one tree break hook calls. Redirecting the
 *    specifier keeps every piece — compiled tab, jsx runtime, react-dom — on the
 *    same instance.
 */
import { registerHooks, createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

const requireWeb = createRequire('D:/Workbase/deepseek-harness/apps/web/package.json')
const reactPath = pathToFileURL(requireWeb.resolve('react')).href
const jsxRuntimePath = pathToFileURL(requireWeb.resolve('react/jsx-runtime')).href

registerHooks({
  resolve(specifier, context, next) {
    if (specifier === 'react' || specifier === 'react/jsx-runtime') {
      console.error('  react redirect: ' + (specifier === 'react' ? reactPath : jsxRuntimePath)); return { url: specifier === 'react' ? reactPath : jsxRuntimePath, shortCircuit: true, format: 'commonjs' }
    }
    if (specifier.endsWith('.module.css')) {
      return { url: `css-shim:${specifier}`, shortCircuit: true, format: 'module' }
    }
    return next(specifier, context)
  },
  load(url, context, next) {
    if (url.startsWith('css-shim:')) {
      return {
        shortCircuit: true,
        format: 'module',
        source: 'export default new Proxy({}, { get: (_target, key) => String(key) });',
      }
    }
    return next(url, context)
  },
})
