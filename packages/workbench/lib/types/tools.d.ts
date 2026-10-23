import type { ToolDefinition } from '@deepseek-ai/dsh-tools';
import type { WorkItemStatus, WorkbenchCreateRequest, WorkbenchSearchRequest, WorkbenchSearchValue, WorkbenchWriteValue } from './types.ts';
/** One workspace a tool call may act on. */
export interface WorkbenchToolWorkspace {
    /** Durable workspace id, in the spelling the Remote contract uses. */
    readonly id: string;
    /** Canonical directory path; carried so an answer can say where it came from. */
    readonly path: string;
}
/**
 * Everything the two tools need from the Host.
 *
 * Declared here rather than as a `Context` read so the tool rules stay testable
 * in isolation: a test supplies four functions, and no storage domain, registry,
 * or cordis service is involved.
 */
export interface WorkbenchToolHost {
    /** The same query the right-sidebar pane sends. */
    search(request: WorkbenchSearchRequest): Promise<WorkbenchSearchValue>;
    /** The same creation path the pane's composer uses. */
    create(request: WorkbenchCreateRequest): Promise<WorkbenchWriteValue>;
    /** Workspace whose session account holds `sessionId`, or `undefined` when none does. */
    workspaceOfSession(sessionId: string): WorkbenchToolWorkspace | undefined;
    /** Workspace by durable id, for the explicit override. */
    workspaceById(workspaceId: string): WorkbenchToolWorkspace | undefined;
}
/** One row `workbench_search` returns. */
export interface WorkbenchSearchToolItem {
    readonly id: string;
    readonly title: string;
    readonly desc: string;
    /** `''` means the item has no tag. */
    readonly tag: string;
    readonly status: WorkItemStatus;
    readonly archived: boolean;
    /** ISO-8601 UTC with millisecond precision; the item's current version. */
    readonly updateAt: string;
    readonly createdAt: string;
}
/** The canonical value `workbench_search` returns. */
export interface WorkbenchSearchToolValue {
    readonly workspaceId: string;
    readonly workspacePath: string;
    /** Matches before paging, so the model can tell a page from the whole set. */
    readonly total: number;
    readonly counts: {
        readonly all: number;
        readonly active: number;
        readonly done: number;
        readonly archived: number;
    };
    readonly items: readonly WorkbenchSearchToolItem[];
}
/** The canonical value `workbench_create` returns. */
export interface WorkbenchCreateToolValue {
    readonly id: string;
    readonly title: string;
    readonly status: WorkItemStatus;
    readonly workspaceId: string;
    readonly workspacePath: string;
    readonly createdAt: string;
}
/**
 * Build `workbench_search`.
 * @param host - the service capabilities.
 * @returns the registry-ready tool definition.
 */
export declare function workbenchSearchTool(host: WorkbenchToolHost): ToolDefinition;
/**
 * Build `workbench_create`.
 * @param host - the service capabilities.
 * @returns the registry-ready tool definition.
 */
export declare function workbenchCreateTool(host: WorkbenchToolHost): ToolDefinition;
//# sourceMappingURL=tools.d.ts.map