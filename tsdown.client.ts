/**
 * Standalone build preset for this package's two halves: the Node library
 * (`nodeLibrary`) and the browser closure-factory bundle (`clientBundle`).
 *
 * This replaces `packages/client/tsdown.client.ts` from the deepseek-harness
 * monorepo, which is repository-internal and not published. The artifact rules
 * below are the ones the browser shell depends on, and they are the reason this
 * file exists rather than a plain tsdown config:
 *
 * 1. The browser half is a closure factory: the bundle calls
 *    `window.__ModuleLoader__.load({ id, factory })` and resolves its externals
 *    through the `require` the loader hands to the factory. The id must equal
 *    the Loader row's package name (`dsh-plugin-workbench`), which is also the
 *    package.json name that the client module registry keys the row by.
 * 2. Only the shell's static module table stays external; everything else
 *    (zod, the generated Remote contribution) is inlined, because a `require()`
 *    the module table cannot answer throws at materialization.
 * 3. CSS Modules are compiled by lightningcss inside the bundle: a
 *    `.module.css` import yields its hashed class map and injects one tagged
 *    `<style>` per stylesheet at factory execution. The virtual id keeps the
 *    stylesheet away from tsdown's own CSS pipeline, which is not installed
 *    here; the `.mjs` suffix is required because that pipeline's guard matches
 *    ids ending in `.css`.
 * 4. Source maps chain through the tsc maps under `lib/types`, so a browser
 *    stack frame resolves back to the original `.tsx`.
 * 5. Raster assets are inlined as `data:` URLs: the artifact is one
 *    `client.js` served from the plugin route, so a sibling file emitted by
 *    the asset pipeline would have nowhere to be requested from.
 *
 * Deliberately not ported from the monorepo preset, because each one is a
 * repository-level gate rather than an artifact rule:
 * `BundleInputIsolation` (the source/artifact-plane check over bundle inputs),
 * the `dsh-client-bundle-purity` resolveId gate (its `INLINE_SAFE` allowlist
 * names other monorepo packages), `asyncChunkRequirePlugin` (this package has
 * no dynamic `import()` chunks), and the `?inline`/global stylesheet virtual
 * loaders (this package ships only `.module.css`).
 */
import { existsSync, readFileSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { createRequire, isBuiltin } from 'node:module'
import { basename, dirname, isAbsolute, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'
import { transform } from 'lightningcss'
import type { UserConfig } from 'tsdown'

/** Repository root: this config file sits beside it. */
const REPO_ROOT = dirname(fileURLToPath(import.meta.url))

/** The build project directory holding `src/` and receiving `lib/`. */
const PACKAGE_DIR = resolve(REPO_ROOT, 'packages', 'workbench')

/** Where both halves emit: the Node bundle, the browser bundle, and tsc types. */
const LIB_DIR = resolve(PACKAGE_DIR, 'lib')

/** Path segment separating a package's tsc output from the sources it was emitted from. */
const TYPES_MARKER = `${sep}lib${sep}types${sep}`

/** Trailing sourcemap reference tsc appends to every emitted module. */
const SOURCEMAP_COMMENT = /\n\/\/# sourceMappingURL=.*\s*$/

/**
 * The module specifiers the shell shares into the frozen module table
 * (`PLATFORM_MODULES` in the monorepo's `packages/client/web/src/platform.ts`)
 * plus the parser-preloaded rows (`PRELOADED_CLIENT_EXTERNALS`, empty there).
 * A copy, not an import: the shell belongs to the profile, not to this package.
 * Specifiers added to the shell's table after this file was written are simply
 * inlined here instead of shared, which duplicates a module identity only for
 * values this package would have to request through `dsh.client.external`.
 */
const PLATFORM_MODULES: readonly string[] = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-ui-dockkit',
]

/** Rows the parser preloads before the shell starts; none today. */
const PRELOADED_CLIENT_EXTERNALS: readonly string[] = []

/**
 * Virtual-id wrapper keeping module CSS away from tsdown's own css pipeline.
 * The suffix matters: that guard matches ids ending in `.css`.
 */
const CSS_VIRTUAL_PREFIX = '\0dsh-css:'
const CSS_VIRTUAL_SUFFIX = '.mjs'

/** Virtual-id wrapper for an inlined raster asset. */
const ASSET_VIRTUAL_PREFIX = '\0dsh-asset:'

/** Raster formats inlined as data URLs; SVG stays source text and is not matched. */
const RASTER_ASSET = /\.(?:png|webp|jpe?g|gif|avif)$/i

/** MIME type per inlined raster extension, keyed by lowercase suffix. */
const ASSET_MIME: Readonly<Record<string, string>> = {
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.avif': 'image/avif',
}

/** Escape a package name for literal use inside a RegExp source. */
function escapeSpecifier(name: string): string {
  return name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** Whether an import specifier is the named package or one of its subpaths. */
function matchesSpecifier(patterns: readonly RegExp[], specifier: string): boolean {
  return patterns.some(pattern => pattern.test(specifier))
}

/**
 * The package's production dependency names: what the Node half leaves external.
 * Read from the published manifest, whose `dependencies` are what a real install
 * puts on disk; peer dependencies stay external for the same reason.
 * @returns one `^name(/|$)` pattern per production dependency, name-sorted.
 */
function productionExternals(): readonly RegExp[] {
  const manifest = JSON.parse(readFileSync(resolve(REPO_ROOT, 'package.json'), 'utf8')) as {
    dependencies?: Record<string, string>
    peerDependencies?: Record<string, string>
    optionalDependencies?: Record<string, string>
  }
  const names = new Set([
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
  ])
  return [...names].sort().map(name => new RegExp(`^${escapeSpecifier(name)}(/|$)`))
}

/**
 * Emit one plugin-owned style injector and the CSS Modules class map.
 * @param id - package name, stamped onto the injected style tag.
 * @param fileId - physical stylesheet path, used for the tag identity.
 * @param css - compiled stylesheet text.
 * @param classMap - hashed local name to generated class name, when the sheet is a module.
 * @returns the module body for the virtual stylesheet id.
 */
function styleInjectionModule(
  id: string,
  fileId: string,
  css: string,
  classMap?: Readonly<Record<string, string>>,
): string {
  const source = [
    `const css = ${JSON.stringify(css)};`,
    `const tagId = ${JSON.stringify(`${id}/${basename(fileId)}`)};`,
    'if (typeof document !== \'undefined\' && document.querySelector(\'style[data-plugin-css=\' + JSON.stringify(tagId) + \']\') === null) {',
    '  const tag = document.createElement(\'style\');',
    `  tag.dataset.plugin = ${JSON.stringify(id)};`,
    '  tag.dataset.pluginCss = tagId;',
    '  tag.textContent = css;',
    '  document.head.appendChild(tag);',
    '}',
  ]
  source.push(classMap === undefined ? 'export {};' : `export default ${JSON.stringify(classMap)};`)
  return source.join('\n')
}

/**
 * Emit one raster asset as a data-URL module.
 * @param fileId - physical asset path; its extension picks the MIME type.
 * @param data - the asset bytes.
 * @returns the module body for the virtual asset id.
 */
function assetModule(fileId: string, data: Buffer): string {
  const extension = fileId.slice(fileId.lastIndexOf('.')).toLowerCase()
  const mime = ASSET_MIME[extension]
  if (mime === undefined) throw new Error(`client asset: ${fileId} has no MIME mapping`)
  const url = `data:${mime};base64,${data.toString('base64')}`
  return `export default ${JSON.stringify(url)};`
}

/**
 * Resolve an emitted JavaScript asset import back to its source-tree counterpart.
 * tsc copies a `./x.module.css` import verbatim into `lib/types`, where the
 * stylesheet does not exist, so the import is re-pointed at `src`.
 * @param source - the import specifier as written in the emitted module.
 * @param importer - absolute path of the emitted module.
 * @returns the absolute path of the physical stylesheet.
 */
function sourceAssetPath(source: string, importer: string): string {
  if (!source.startsWith('.') && !isAbsolute(source)) return createRequire(importer).resolve(source)
  const emitted = resolve(dirname(importer), source)
  if (existsSync(emitted)) return emitted
  const boundary = emitted.indexOf(TYPES_MARKER)
  if (boundary < 0) return emitted
  return resolve(emitted.slice(0, boundary), 'src', emitted.slice(boundary + TYPES_MARKER.length))
}

/**
 * Map a source path onto the URL the browser resolves it by. The map is served
 * from `/plugins/<package>/client.js.map`, so three levels up reach the
 * document root the repository tree is served under.
 * @param source - absolute source path recorded in the chained map.
 * @returns the relative URL recorded in the emitted map.
 */
function browserSourcePath(source: string): string {
  return `../../../${relative(REPO_ROOT, source).split(sep).join('/')}`
}

/** Chain tsc's emitted maps into the browser bundle that consumes `lib/types`. */
function tscSourceMapPlugin(): {
  name: string
  load: (id: string) => Promise<{ code: string, map: unknown } | null>
} {
  return {
    name: 'dsh-tsc-sourcemap',
    async load(id: string) {
      if (!id.includes(TYPES_MARKER) || !id.endsWith('.js') || !existsSync(`${id}.map`)) return null
      const code = await readFile(id, 'utf8')
      const mapPath = `${id}.map`
      const map = JSON.parse(await readFile(mapPath, 'utf8')) as {
        sourceRoot?: unknown
        sources?: unknown
        sourcesContent?: unknown
        [key: string]: unknown
      }
      if (!Array.isArray(map.sources) || map.sources.some(source => typeof source !== 'string')) {
        throw new Error(`client sourcemap: ${mapPath} has invalid sources`)
      }
      const sources = map.sources as string[]
      if (
        !Array.isArray(map.sourcesContent)
        || map.sourcesContent.length !== sources.length
        || map.sourcesContent.some(source => typeof source !== 'string')
      ) {
        const sourceRoot = typeof map.sourceRoot === 'string' ? map.sourceRoot : ''
        map.sourcesContent = await Promise.all(sources.map(async source =>
          await readFile(resolve(dirname(mapPath), sourceRoot, source), 'utf8')))
      }
      return { code: code.replace(SOURCEMAP_COMMENT, ''), map }
    },
  }
}

/**
 * The Node half: one ESM bundle per tsc-emitted entry, with production
 * dependencies left external (a real install has them) and everything else
 * inlined.
 * @param id - package name, used in tsdown diagnostics.
 * @param libEntry - tsc-emitted entries, spelled at the call site relative to the package directory.
 * @param overrides - per-package tsdown overrides.
 * @returns the tsdown config for the Node half.
 */
export function nodeLibrary(
  id: string,
  libEntry: readonly string[],
  overrides: UserConfig = {},
): UserConfig {
  const externals = productionExternals()
  const isProductionDependency = (specifier: string): boolean =>
    matchesSpecifier(externals, specifier)
  return {
    name: id,
    entry: libEntry.map(entry => resolve(PACKAGE_DIR, entry)),
    outDir: LIB_DIR,
    format: ['esm'],
    platform: 'node',
    target: 'es2024',
    fixedExtension: false,
    dts: false,
    clean: false,
    deps: {
      // Stating both halves takes the artifact off tsdown's production-deps
      // fallback, where moving a name between npm sections would silently
      // re-bundle it. Builtins keep tsdown's own handling.
      neverBundle: isProductionDependency,
      alwaysBundle: (specifier: string) =>
        !isBuiltin(specifier) && !isProductionDependency(specifier),
    },
    ...overrides,
  }
}

/**
 * The browser half: a CJS closure factory registered under `id`, with the
 * shell's module-table specifiers left external and every other import inlined.
 * @param id - package name; must equal the Loader row's package name and the package.json name.
 * @param entry - tsc-emitted browser entry, relative to the package directory.
 * @param options - extra inlined specifiers and additional resolve aliases.
 * @returns the tsdown config for the browser half.
 */
export function clientBundle(
  id: string,
  entry: string,
  options: {
    /** Package-specific module-table requests, in addition to the shell baseline. */
    readonly external?: readonly string[]
    /** Absolute paths resolved before dependency resolution, keyed by specifier. */
    readonly alias?: Readonly<Record<string, string>>
  } = {},
): UserConfig {
  const requested = new Set([
    ...PLATFORM_MODULES,
    ...PRELOADED_CLIENT_EXTERNALS,
    ...(options.external ?? []),
  ])
  const isRequested = (specifier: string): boolean => requested.has(specifier)
  return {
    name: `${id}/client`,
    entry: { client: resolve(PACKAGE_DIR, entry) },
    outDir: LIB_DIR,
    format: 'cjs',
    platform: 'browser',
    target: 'es2024',
    // Types ship from lib/types (tsc); dts here would wrap the factory
    // banner/footer into a .d.cts and break parsing.
    dts: false,
    // The browser bundle lands beside the Node half in one artifact directory;
    // the pinned entryFileNames keeps it exactly lib/client.js.
    clean: false,
    sourcemap: true,
    deps: {
      neverBundle: isRequested,
      alwaysBundle: (specifier: string) => !isRequested(specifier),
    },
    // Dual-mode libraries resolve their static flavor matching the NODE_ENV the
    // defines below bake in.
    inputOptions: {
      resolve: {
        conditionNames: [
          (process.env.NODE_ENV ?? 'production') === 'development' ? 'development' : 'production',
          'browser', 'import', 'module', 'default',
        ],
      },
    },
    // Browser bundles inline node-idiom deps that probe process.env.NODE_ENV and
    // import.meta.env.MODE; a CJS output cannot carry an empty import.meta.
    define: {
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env.MODE': JSON.stringify(process.env.NODE_ENV ?? 'production'),
      'import.meta.env': JSON.stringify({ MODE: process.env.NODE_ENV ?? 'production' }),
    },
    plugins: [{
      // Rolldown's resolver is not required to implement package self-reference,
      // so the generated Remote contribution is bound explicitly.
      name: 'dsh-client-alias',
      resolveId(source: string) {
        return options.alias?.[source] ?? null
      },
    }, tscSourceMapPlugin(), {
      // The artifact is a single file, so an image import becomes its bytes
      // rather than an emitted sibling URL.
      name: 'dsh-asset-inline',
      resolveId(source: string, importer: string | undefined) {
        if (!RASTER_ASSET.test(source)) return null
        const absolute = importer !== undefined ? sourceAssetPath(source, importer) : source
        return ASSET_VIRTUAL_PREFIX + absolute
      },
      async load(virtualId: string) {
        if (!virtualId.startsWith(ASSET_VIRTUAL_PREFIX)) return null
        const fileId = virtualId.slice(ASSET_VIRTUAL_PREFIX.length)
        // The virtual id otherwise hides the physical file from the watch graph.
        this.addWatchFile(fileId)
        return assetModule(fileId, await readFile(fileId))
      },
    }, {
      name: 'dsh-css-modules-inline',
      resolveId(source: string, importer: string | undefined) {
        if (!source.endsWith('.module.css')) return null
        const absolute = importer !== undefined ? sourceAssetPath(source, importer) : source
        return CSS_VIRTUAL_PREFIX + absolute + CSS_VIRTUAL_SUFFIX
      },
      async load(virtualId: string) {
        if (!virtualId.startsWith(CSS_VIRTUAL_PREFIX)) return null
        const fileId = virtualId.slice(CSS_VIRTUAL_PREFIX.length, -CSS_VIRTUAL_SUFFIX.length)
        // The virtual id otherwise hides the physical stylesheet from the watch graph.
        this.addWatchFile(fileId)
        const source = await readFile(fileId)
        const { code, exports: cssExports } = transform({
          filename: fileId,
          code: source,
          cssModules: { pattern: '[hash]_[local]' },
          minify: true,
        })
        const classMap: Record<string, string> = {}
        const exportEntries = Object.entries(cssExports ?? {})
          .sort(([left], [right]) => (left < right ? -1 : left > right ? 1 : 0))
        for (const [local, exported] of exportEntries) classMap[local] = exported.name
        return styleInjectionModule(id, fileId, code.toString(), classMap)
      },
    }],
    outputOptions: {
      entryFileNames: 'client.js',
      sourcemapExcludeSources: false,
      sourcemapPathTransform(source: string) {
        return browserSourcePath(source)
      },
      banner: (chunk: { readonly isEntry: boolean, readonly fileName: string }) => {
        const registration = `window.__ModuleLoader__.load({ id: ${JSON.stringify(id)}, ${chunk.isEntry ? '' : `chunk: ${JSON.stringify(chunk.fileName)}, `}factory: (require) => {`
        return registration
      },
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  }
}
