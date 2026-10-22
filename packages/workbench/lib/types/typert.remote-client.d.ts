import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol';
import type { WorkbenchCreateRequest, WorkbenchDeleteRequest, WorkbenchDeleteValue, WorkbenchProbeValue, WorkbenchRequestCompleteRequest, WorkbenchSearchRequest, WorkbenchSearchValue, WorkbenchSetDescRequest, WorkbenchUpdateRequest, WorkbenchWriteValue } from './types.ts';
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface TypertRemoteNamespace$776f726b62656e63 {
        create: (request: WorkbenchCreateRequest) => Promise<RemoteResult<WorkbenchWriteValue>>;
        delete: (request: WorkbenchDeleteRequest) => Promise<RemoteResult<WorkbenchDeleteValue>>;
        probe: () => Promise<RemoteResult<WorkbenchProbeValue>>;
        requestComplete: (request: WorkbenchRequestCompleteRequest) => Promise<RemoteResult<WorkbenchWriteValue>>;
        search: (request: WorkbenchSearchRequest) => Promise<RemoteResult<WorkbenchSearchValue>>;
        setDesc: (request: WorkbenchSetDescRequest) => Promise<RemoteResult<WorkbenchWriteValue>>;
        update: (request: WorkbenchUpdateRequest) => Promise<RemoteResult<WorkbenchWriteValue>>;
    }
    interface TypertRemoteMap {
        'workbench/create': (request: WorkbenchCreateRequest) => Promise<RemoteResult<WorkbenchWriteValue>>;
        'workbench/delete': (request: WorkbenchDeleteRequest) => Promise<RemoteResult<WorkbenchDeleteValue>>;
        'workbench/probe': () => Promise<RemoteResult<WorkbenchProbeValue>>;
        'workbench/requestComplete': (request: WorkbenchRequestCompleteRequest) => Promise<RemoteResult<WorkbenchWriteValue>>;
        'workbench/search': (request: WorkbenchSearchRequest) => Promise<RemoteResult<WorkbenchSearchValue>>;
        'workbench/setDesc': (request: WorkbenchSetDescRequest) => Promise<RemoteResult<WorkbenchWriteValue>>;
        'workbench/update': (request: WorkbenchUpdateRequest) => Promise<RemoteResult<WorkbenchWriteValue>>;
    }
    interface TypertRemoteNamespaceMap {
        'workbench': TypertRemoteNamespace$776f726b62656e63;
    }
}
/** Client-side projection of the Host Remote contract. */
export declare const TYPERT_REMOTE: TypertRemoteContribution;
export default TYPERT_REMOTE;
//# sourceMappingURL=typert.remote-client.d.ts.map