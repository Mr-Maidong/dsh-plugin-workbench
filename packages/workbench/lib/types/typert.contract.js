/**
 * The wire contract between the Host service and the browser half.
 *
 * WHY THIS FILE EXISTS — read before "simplifying" it away
 * --------------------------------------------------------
 * `@deepseek-ai/dsh-typert-generator` cannot emit this package's Typert
 * artifacts. Its `isTypeMetaSymbol` recognizes a `@Remote` decorator only when
 * the protocol's declaration file belongs to a package registered in the
 * analysis workspace (physically under the repository's `packages/`) or sits
 * inside an ambient `declare module '@deepseek-ai/dsh-typert-protocol'`. In a
 * standalone plugin repository the protocol resolves from `node_modules`, so
 * neither holds: the generator collects zero invocations and fails the build
 * with "publishes Remote artifacts but has no Remote methods". Verified against
 * generator 0.2.0-rc.2 and 0.2.1-alpha.2, and reproduced on the reference plugin
 * `dsh-mcp-mcp-status` — whose committed artifacts still install and run, because
 * installing consumes them and never regenerates them.
 *
 * Nothing else is lost. The generator's decorator-lowering half is redundant
 * here: it only matches TypeScript sources, every bundle entry is already a
 * tsc-emitted `.js`, and `tsc` lowers standard decorators itself.
 *
 * So the generated artifacts are maintained here by hand instead, and the
 * contract is declared ONCE here and projected into both `typert.host.ts` and
 * `typert.remote-client.ts` so the two faces cannot drift apart.
 *
 * Writing it by hand is also strictly less duplication than the generator's
 * output, which emits the same zod schemas twice — once in the Host artifact and
 * again in the Client artifact (see `dsh-mcp-mcp-status`'s committed pair). Both
 * faces import this one list, so the schemas exist once.
 *
 * THE SAFETY NET: `tests/remote-contract.spec.ts` instantiates the real
 * `WorkbenchService` and asserts that `remoteMethods(service)` — the markers the
 * protocol reads off the live class prototype — matches these descriptors
 * entry for entry. Adding or renaming a `@Remote` method without updating this
 * file fails the test; it is not left to reviewer memory.
 *
 * @see ../../../../DESIGN.md §2, §4.1, §7
 */
import { z } from 'zod';
/** npm package name; also the Remote contribution's owning identity. */
export const PACKAGE_NAME = 'dsh-plugin-workbench';
/** Cordis service key, and the wire namespace the client calls it under. */
export const SERVICE_KEY = 'workbench';
/**
 * Memoize a schema constructor.
 *
 * `TypertCodec.create` is documented as materializing the schema "on first
 * boundary use", so the protocol may call it on every invocation; rebuilding a
 * nested record schema each time would be pure waste. The generator emits the
 * same `??=` shape, so this is its idiom rather than a local invention.
 */
function lazy(build) {
    let value;
    return () => (value ??= build());
}
/**
 * Build a strict codec for one boundary type.
 *
 * `typeSymbol` is `${package}/types#${TypeName}` — the exact spelling the
 * generator uses for a named export of the package's `./types` entry, which is
 * what makes these artifacts interchangeable with generated ones.
 */
function codec(typeName, create) {
    return { mode: 'strict', typeSymbol: `${PACKAGE_NAME}/types#${typeName}`, create };
}
/**
 * Build a JSON parameter descriptor.
 *
 * Every P1 method takes a single named request object rather than a positional
 * list: it keeps the wire `args` legible, and it lets a later field be added
 * without renumbering anything. `wire` matches `name` because no renaming is
 * needed for an object parameter.
 */
function param(name, typeName, create) {
    return { name, wire: name, source: 'json', codec: codec(typeName, create) };
}
/*
 * `.readonly()` is applied to objects and arrays, and deliberately not to
 * scalars. It is a type-level wrapper with no parsing effect, and the inferred
 * type is not consumed anywhere — `types.ts` is the source of truth for every
 * shape here, and the codecs exist to validate at the boundary. Marking
 * containers documents the intent where it is visible; marking `z.string()`
 * would be noise.
 */
/** Mirrors {@link WorkItemStatus}. */
const statusSchema = lazy(() => z.enum(['open', 'in_progress', 'done']));
/** Mirrors {@link ChangedFile}. */
const changedFileSchema = lazy(() => z.object({
    path: z.string(),
    purpose: z.string(),
}).readonly());
/** Mirrors {@link VerificationEntry}. */
const verificationEntrySchema = lazy(() => z.object({
    command: z.string(),
    result: z.enum(['passed', 'failed', 'skipped']),
    note: z.string().optional(),
}).readonly());
/** Mirrors {@link WorkbenchCompletion}. */
const completionSchema = lazy(() => z.object({
    summary: z.string(),
    implementationPath: z.array(z.string()).readonly(),
    changedFiles: z.array(changedFileSchema()).readonly(),
    verification: z.array(verificationEntrySchema()).readonly(),
    completedAt: z.string(),
    completedBy: z.enum(['model', 'user']),
}).readonly());
/** Mirrors {@link WorkItemRecord}. */
const workItemRecordSchema = lazy(() => z.object({
    id: z.string(),
    workspaceId: z.string(),
    workspacePath: z.string(),
    title: z.string(),
    desc: z.string(),
    tag: z.string(),
    status: statusSchema(),
    archived: z.boolean(),
    archivedAt: z.string().optional(),
    updateAt: z.string(),
    createdAt: z.string(),
    completion: completionSchema().optional(),
}).readonly());
/** Mirrors {@link WorkbenchArchivedScope}. */
const archivedScopeSchema = lazy(() => z.enum(['exclude', 'include', 'only']));
const probeValueSchema = lazy(() => z.object({
    domain: z.string(),
    itemCount: z.number().int().nonnegative(),
}).readonly());
const searchRequestSchema = lazy(() => z.object({
    workspaceId: z.string().optional(),
    query: z.string().optional(),
    status: z.array(statusSchema()).readonly().optional(),
    tag: z.string().optional(),
    archived: archivedScopeSchema().optional(),
    offset: z.number().int().nonnegative().optional(),
    limit: z.number().int().positive().optional(),
}).readonly());
/** Mirrors {@link WorkbenchSearchCounts}. */
const searchCountsSchema = lazy(() => z.object({
    all: z.number().int().nonnegative(),
    active: z.number().int().nonnegative(),
    done: z.number().int().nonnegative(),
    archived: z.number().int().nonnegative(),
}).readonly());
const searchValueSchema = lazy(() => z.object({
    items: z.array(workItemRecordSchema()).readonly(),
    total: z.number().int().nonnegative(),
    counts: searchCountsSchema(),
}).readonly());
const createRequestSchema = lazy(() => z.object({
    workspaceId: z.string(),
    title: z.string(),
    desc: z.string().optional(),
    tag: z.string().optional(),
}).readonly());
const setDescRequestSchema = lazy(() => z.object({
    workspaceId: z.string(),
    id: z.string(),
    desc: z.string(),
    mode: z.enum(['replace', 'append']).optional(),
    expectedUpdateAt: z.string().optional(),
}).readonly());
const updateRequestSchema = lazy(() => z.object({
    workspaceId: z.string(),
    id: z.string(),
    title: z.string().optional(),
    tag: z.string().optional(),
    expectedUpdateAt: z.string().optional(),
}).readonly());
const requestCompleteRequestSchema = lazy(() => z.object({
    workspaceId: z.string(),
    id: z.string(),
    expectedUpdateAt: z.string().optional(),
}).readonly());
const deleteRequestSchema = lazy(() => z.object({
    workspaceId: z.string(),
    id: z.string(),
}).readonly());
const archiveRequestSchema = lazy(() => z.object({
    workspaceId: z.string(),
    id: z.string(),
    archived: z.boolean(),
    expectedUpdateAt: z.string().optional(),
}).readonly());
/**
 * The three ways a write and a delete differ, and the one way they do not.
 *
 * `ok` carries the record because every successful write changes `updateAt`,
 * and handing it back is what lets the caller skip a re-read. `not_found` and
 * `conflict` carry just enough to say *which* item and, for a conflict, what it
 * currently is.
 */
const writeValueSchema = lazy(() => z.union([
    z.object({ code: z.literal('ok'), item: workItemRecordSchema() }).readonly(),
    z.object({ code: z.literal('not_found'), id: z.string() }).readonly(),
    z.object({ code: z.literal('conflict'), current: workItemRecordSchema() }).readonly(),
    z.object({ code: z.literal('invalid'), message: z.string() }).readonly(),
]));
const deleteValueSchema = lazy(() => z.union([
    z.object({ code: z.literal('ok'), id: z.string() }).readonly(),
    z.object({ code: z.literal('not_found'), id: z.string() }).readonly(),
    z.object({ code: z.literal('conflict'), current: workItemRecordSchema() }).readonly(),
]));
/**
 * Every Remote method this package publishes, in one list.
 *
 * `sourceLocation` is deliberately omitted: the protocol types it as optional
 * and diagnostic-only, and a hand-maintained line number would drift the moment
 * `index.ts` is edited — pointing diagnostics at the wrong method is worse than
 * having none.
 */
export const INVOCATIONS = [
    {
        id: `${PACKAGE_NAME}#${SERVICE_KEY}/probe`,
        service: SERVICE_KEY,
        namespace: SERVICE_KEY,
        method: 'probe',
        invocation: { kind: 'direct' },
        parameters: [],
        result: codec('WorkbenchProbeValue', probeValueSchema),
    },
    {
        id: `${PACKAGE_NAME}#${SERVICE_KEY}/search`,
        service: SERVICE_KEY,
        namespace: SERVICE_KEY,
        method: 'search',
        invocation: { kind: 'direct' },
        parameters: [param('request', 'WorkbenchSearchRequest', searchRequestSchema)],
        result: codec('WorkbenchSearchValue', searchValueSchema),
    },
    {
        id: `${PACKAGE_NAME}#${SERVICE_KEY}/create`,
        service: SERVICE_KEY,
        namespace: SERVICE_KEY,
        method: 'create',
        invocation: { kind: 'direct' },
        parameters: [param('request', 'WorkbenchCreateRequest', createRequestSchema)],
        result: codec('WorkbenchWriteValue', writeValueSchema),
    },
    {
        id: `${PACKAGE_NAME}#${SERVICE_KEY}/setDesc`,
        service: SERVICE_KEY,
        namespace: SERVICE_KEY,
        method: 'setDesc',
        invocation: { kind: 'direct' },
        parameters: [param('request', 'WorkbenchSetDescRequest', setDescRequestSchema)],
        result: codec('WorkbenchWriteValue', writeValueSchema),
    },
    {
        id: `${PACKAGE_NAME}#${SERVICE_KEY}/update`,
        service: SERVICE_KEY,
        namespace: SERVICE_KEY,
        method: 'update',
        invocation: { kind: 'direct' },
        parameters: [param('request', 'WorkbenchUpdateRequest', updateRequestSchema)],
        result: codec('WorkbenchWriteValue', writeValueSchema),
    },
    {
        id: `${PACKAGE_NAME}#${SERVICE_KEY}/requestComplete`,
        service: SERVICE_KEY,
        namespace: SERVICE_KEY,
        method: 'requestComplete',
        invocation: { kind: 'direct' },
        parameters: [param('request', 'WorkbenchRequestCompleteRequest', requestCompleteRequestSchema)],
        result: codec('WorkbenchWriteValue', writeValueSchema),
    },
    {
        id: `${PACKAGE_NAME}#${SERVICE_KEY}/archive`,
        service: SERVICE_KEY,
        namespace: SERVICE_KEY,
        method: 'archive',
        invocation: { kind: 'direct' },
        parameters: [param('request', 'WorkbenchArchiveRequest', archiveRequestSchema)],
        result: codec('WorkbenchWriteValue', writeValueSchema),
    },
    {
        id: `${PACKAGE_NAME}#${SERVICE_KEY}/delete`,
        service: SERVICE_KEY,
        namespace: SERVICE_KEY,
        method: 'delete',
        invocation: { kind: 'direct' },
        parameters: [param('request', 'WorkbenchDeleteRequest', deleteRequestSchema)],
        result: codec('WorkbenchDeleteValue', deleteValueSchema),
    },
];
//# sourceMappingURL=typert.contract.js.map