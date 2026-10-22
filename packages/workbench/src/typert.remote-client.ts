/**
 * Hand-maintained Client-face Remote artifact — normally generated, see
 * `typert.contract.ts` for why it is written here instead.
 *
 * `packages/workbench/package.json` maps `./remote` here, and the browser half
 * mounts it with `ctx.remote.$mount(...)`. It is the same projection the
 * generator would emit: the shared contract's descriptors verbatim.
 *
 * The `declare module` block below is not decoration — it is the other half of
 * what the generator writes. `TypertRemoteNamespaceMap` is a merge-extensible
 * interface, and this block is the only thing that teaches `remote.workbench`
 * it exists. Drop it and the browser half fails to compile on
 * `ctx.remote.workbench` ("Property 'workbench' does not exist on type
 * 'ClientRemote'") even though every runtime piece is present.
 *
 * Restate it exactly as the generator would, no more and no less. The named
 * interface is declared inside this same block, so it is in scope only here —
 * a second augmentation block elsewhere cannot reference it by name.
 *
 * The generated form augments three interfaces and uses a hex-encoded namespace
 * interface name; both are reproduced here so this file stays a drop-in
 * replacement rather than a lookalike. `TypertRemoteNamespace$776f726b62656e63`
 * is "workbench" in hex.
 *
 * SIGNATURE SHAPE: every unary method takes ONE `request` argument and returns
 * `Promise<RemoteResult<Value>>`; a parameterless method takes none. Copied from
 * a real generated artifact (`dsh-api-workspace-controller`'s
 * `lib/typert.remote-client.d.ts`), including the alphabetical member order, so
 * a future diff against generator output is about content and not formatting.
 */
import { INVOCATIONS, PACKAGE_NAME } from './typert.contract.ts'
import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol'
import type {
  WorkbenchArchiveRequest,
  WorkbenchCreateRequest,
  WorkbenchDeleteRequest,
  WorkbenchDeleteValue,
  WorkbenchProbeValue,
  WorkbenchRequestCompleteRequest,
  WorkbenchSearchRequest,
  WorkbenchSearchValue,
  WorkbenchSetDescRequest,
  WorkbenchUpdateRequest,
  WorkbenchWriteValue,
} from './types.ts'

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface TypertRemoteNamespace$776f726b62656e63 {
    archive: (request: WorkbenchArchiveRequest) => Promise<RemoteResult<WorkbenchWriteValue>>
    create: (request: WorkbenchCreateRequest) => Promise<RemoteResult<WorkbenchWriteValue>>
    delete: (request: WorkbenchDeleteRequest) => Promise<RemoteResult<WorkbenchDeleteValue>>
    probe: () => Promise<RemoteResult<WorkbenchProbeValue>>
    requestComplete: (request: WorkbenchRequestCompleteRequest) => Promise<RemoteResult<WorkbenchWriteValue>>
    search: (request: WorkbenchSearchRequest) => Promise<RemoteResult<WorkbenchSearchValue>>
    setDesc: (request: WorkbenchSetDescRequest) => Promise<RemoteResult<WorkbenchWriteValue>>
    update: (request: WorkbenchUpdateRequest) => Promise<RemoteResult<WorkbenchWriteValue>>
  }
  interface TypertRemoteMap {
    'workbench/archive': (request: WorkbenchArchiveRequest) => Promise<RemoteResult<WorkbenchWriteValue>>
    'workbench/create': (request: WorkbenchCreateRequest) => Promise<RemoteResult<WorkbenchWriteValue>>
    'workbench/delete': (request: WorkbenchDeleteRequest) => Promise<RemoteResult<WorkbenchDeleteValue>>
    'workbench/probe': () => Promise<RemoteResult<WorkbenchProbeValue>>
    'workbench/requestComplete': (request: WorkbenchRequestCompleteRequest) => Promise<RemoteResult<WorkbenchWriteValue>>
    'workbench/search': (request: WorkbenchSearchRequest) => Promise<RemoteResult<WorkbenchSearchValue>>
    'workbench/setDesc': (request: WorkbenchSetDescRequest) => Promise<RemoteResult<WorkbenchWriteValue>>
    'workbench/update': (request: WorkbenchUpdateRequest) => Promise<RemoteResult<WorkbenchWriteValue>>
  }
  interface TypertRemoteNamespaceMap {
    'workbench': TypertRemoteNamespace$776f726b62656e63
  }
}

/** Client-side projection of the Host Remote contract. */
export const TYPERT_REMOTE: TypertRemoteContribution = {
  package: PACKAGE_NAME,
  descriptors: INVOCATIONS,
}

export default TYPERT_REMOTE
