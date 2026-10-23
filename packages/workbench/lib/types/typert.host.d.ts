/** Host-face contribution consumed by the loader. */
export declare const TYPERT: {
    readonly package: "dsh-plugin-workbench";
    readonly face: "host";
    readonly schemas: readonly [];
    readonly invocations: readonly import("@deepseek-ai/dsh-typert-protocol").InvocationDescriptor[];
    readonly model: {
        readonly services: readonly [{
            readonly key: "workbench";
            readonly exportName: "WorkbenchService";
            readonly tags: readonly [];
            readonly members: readonly [{
                readonly kind: "method";
                readonly name: "probe";
                readonly signature: "@Remote('probe') probe(): Promise<WorkbenchProbeValue>";
                readonly summary: "Report that the Host half is mounted and its domain is open.";
            }, {
                readonly kind: "method";
                readonly name: "search";
                readonly signature: "@Remote('search') search(request: WorkbenchSearchRequest): Promise<WorkbenchSearchValue>";
                readonly summary: "Fuzzy-query work items, scored prefix > substring > subsequence.";
            }, {
                readonly kind: "method";
                readonly name: "create";
                readonly signature: "@Remote('create') create(request: WorkbenchCreateRequest): Promise<WorkbenchWriteValue>";
                readonly summary: "Create one work item, always in status open.";
            }, {
                readonly kind: "method";
                readonly name: "setDesc";
                readonly signature: "@Remote('setDesc') setDesc(request: WorkbenchSetDescRequest): Promise<WorkbenchWriteValue>";
                readonly summary: "Replace or append one work item's description.";
            }, {
                readonly kind: "method";
                readonly name: "update";
                readonly signature: "@Remote('update') update(request: WorkbenchUpdateRequest): Promise<WorkbenchWriteValue>";
                readonly summary: "Change one work item's title and tag.";
            }, {
                readonly kind: "method";
                readonly name: "requestComplete";
                readonly signature: "@Remote('requestComplete') requestComplete(request: WorkbenchRequestCompleteRequest): Promise<WorkbenchWriteValue>";
                readonly summary: "Advance a work item to in progress, or retry its write-back idempotently.";
            }, {
                readonly kind: "method";
                readonly name: "archive";
                readonly signature: "@Remote('archive') archive(request: WorkbenchArchiveRequest): Promise<WorkbenchWriteValue>";
                readonly summary: "File a work item away, or bring it back.";
            }, {
                readonly kind: "method";
                readonly name: "delete";
                readonly signature: "@Remote('delete') delete(request: WorkbenchDeleteRequest): Promise<WorkbenchDeleteValue>";
                readonly summary: "Delete one work item.";
            }, {
                readonly kind: "method";
                readonly name: "watch";
                readonly signature: "@Remote({ mode: 'stream' }) watch(signal: AbortSignal): AsyncIterable<WorkbenchChange>";
                readonly summary: "Stream one notice per write so an open pane can re-read its list.";
            }];
            readonly types: readonly [{
                readonly name: "WorkItemStatus";
                readonly declaration: "export type WorkItemStatus = 'open' | 'in_progress' | 'done'";
            }, {
                readonly name: "WorkItemId";
                readonly declaration: "export type WorkItemId = Branded<string, 'WorkItemId'>";
            }, {
                readonly name: "WorkbenchProbeValue";
                readonly declaration: "export interface WorkbenchProbeValue { readonly domain: string; readonly itemCount: number }";
            }, {
                readonly name: "WorkbenchArchivedScope";
                readonly declaration: "export type WorkbenchArchivedScope = 'exclude' | 'include' | 'only'";
            }, {
                readonly name: "WorkbenchSearchRequest";
                readonly declaration: "export interface WorkbenchSearchRequest { readonly workspaceId?: string; readonly query?: string; readonly status?: readonly WorkItemStatus[]; readonly tag?: string; readonly archived?: WorkbenchArchivedScope; readonly offset?: number; readonly limit?: number }";
            }, {
                readonly name: "WorkbenchSearchCounts";
                readonly declaration: "export interface WorkbenchSearchCounts { readonly all: number; readonly active: number; readonly done: number; readonly archived: number }";
            }, {
                readonly name: "WorkbenchSearchValue";
                readonly declaration: "export interface WorkbenchSearchValue { readonly items: readonly WorkItemRecord[]; readonly total: number; readonly counts: WorkbenchSearchCounts }";
            }, {
                readonly name: "WorkbenchCreateRequest";
                readonly declaration: "export interface WorkbenchCreateRequest { readonly workspaceId: string; readonly title: string; readonly desc?: string; readonly tag?: string }";
            }, {
                readonly name: "WorkbenchSetDescRequest";
                readonly declaration: "export interface WorkbenchSetDescRequest { readonly workspaceId: string; readonly id: WorkItemId; readonly desc: string; readonly mode?: 'replace' | 'append'; readonly expectedUpdateAt?: string }";
            }, {
                readonly name: "WorkbenchUpdateRequest";
                readonly declaration: "export interface WorkbenchUpdateRequest { readonly workspaceId: string; readonly id: WorkItemId; readonly title?: string; readonly tag?: string; readonly expectedUpdateAt?: string }";
            }, {
                readonly name: "WorkbenchRequestCompleteRequest";
                readonly declaration: "export interface WorkbenchRequestCompleteRequest { readonly workspaceId: string; readonly id: WorkItemId; readonly expectedUpdateAt?: string }";
            }, {
                readonly name: "WorkbenchDeleteRequest";
                readonly declaration: "export interface WorkbenchDeleteRequest { readonly workspaceId: string; readonly id: WorkItemId }";
            }, {
                readonly name: "WorkbenchArchiveRequest";
                readonly declaration: "export interface WorkbenchArchiveRequest { readonly workspaceId: string; readonly id: WorkItemId; readonly archived: boolean; readonly expectedUpdateAt?: string }";
            }, {
                readonly name: "WorkbenchWriteValue";
                readonly declaration: "export type WorkbenchWriteValue = { readonly code: 'ok'; readonly item: WorkItemRecord } | { readonly code: 'not_found'; readonly id: string } | { readonly code: 'conflict'; readonly current: WorkItemRecord } | { readonly code: 'invalid'; readonly message: string }";
            }, {
                readonly name: "WorkbenchDeleteValue";
                readonly declaration: "export type WorkbenchDeleteValue = { readonly code: 'ok'; readonly id: string } | { readonly code: 'not_found'; readonly id: string } | { readonly code: 'conflict'; readonly current: WorkItemRecord }";
            }, {
                readonly name: "WorkbenchChange";
                readonly declaration: "export interface WorkbenchChange { readonly workspaceId: string; readonly revision: number; readonly at: string }";
            }];
        }];
        readonly events: readonly [];
        readonly objects: readonly [];
    };
};
export default TYPERT;
//# sourceMappingURL=typert.host.d.ts.map