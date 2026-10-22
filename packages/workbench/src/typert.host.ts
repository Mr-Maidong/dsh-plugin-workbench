/**
 * Hand-maintained Host-face Typert contribution — normally generated, see
 * `typert.contract.ts` for why it is written here instead.
 *
 * The loader registers this so the Host publishes the `workbench` namespace to
 * connected peers. `invocations` is projected from the shared contract rather
 * than restated, so this file cannot disagree with the client artifact.
 *
 * `model.services[].types` carries diagnostic summaries, not definitions: the
 * authoritative shapes are in `types.ts`, and nothing validates these strings.
 * They are written compactly on one line each on purpose — a hand-copied
 * multi-line type body would drift from its source without anything noticing.
 *
 * SHAPE (0.2.1-rc.2): the loader validates `model.services` / `model.events` /
 * `model.objects` — the three arrays used to sit at the top level and were
 * rejected with "TYPERT.model must be an object" (DESIGN §9.29). Every service,
 * event, and object also owes `tags: []`; the loader reads it through
 * `requireDocumentation` before it looks at anything else.
 */
import { INVOCATIONS, PACKAGE_NAME, SERVICE_KEY } from './typert.contract.ts'

/** Host-face contribution consumed by the loader. */
export const TYPERT = {
  package: PACKAGE_NAME,
  face: 'host',
  schemas: [],
  invocations: INVOCATIONS,
  model: {
    services: [{
      key: SERVICE_KEY,
      exportName: 'WorkbenchService',
      tags: [],
      members: [
        {
          kind: 'method',
          name: 'probe',
          signature: "@Remote('probe') probe(): Promise<WorkbenchProbeValue>",
          summary: 'Report that the Host half is mounted and its domain is open.',
        },
        {
          kind: 'method',
          name: 'search',
          signature: "@Remote('search') search(request: WorkbenchSearchRequest): Promise<WorkbenchSearchValue>",
          summary: 'Fuzzy-query work items, scored prefix > substring > subsequence.',
        },
        {
          kind: 'method',
          name: 'create',
          signature: "@Remote('create') create(request: WorkbenchCreateRequest): Promise<WorkbenchWriteValue>",
          summary: 'Create one work item, always in status open.',
        },
        {
          kind: 'method',
          name: 'setDesc',
          signature: "@Remote('setDesc') setDesc(request: WorkbenchSetDescRequest): Promise<WorkbenchWriteValue>",
          summary: "Replace or append one work item's description.",
        },
        {
          kind: 'method',
          name: 'update',
          signature: "@Remote('update') update(request: WorkbenchUpdateRequest): Promise<WorkbenchWriteValue>",
          summary: "Change one work item's title and tag.",
        },
        {
          kind: 'method',
          name: 'requestComplete',
          signature: "@Remote('requestComplete') requestComplete(request: WorkbenchRequestCompleteRequest): Promise<WorkbenchWriteValue>",
          summary: 'Advance a work item to in progress, or retry its write-back idempotently.',
        },
        {
          kind: 'method',
          name: 'archive',
          signature: "@Remote('archive') archive(request: WorkbenchArchiveRequest): Promise<WorkbenchWriteValue>",
          summary: 'File a work item away, or bring it back.',
        },
        {
          kind: 'method',
          name: 'delete',
          signature: "@Remote('delete') delete(request: WorkbenchDeleteRequest): Promise<WorkbenchDeleteValue>",
          summary: 'Delete one work item.',
        },
      ],
      types: [
        {
          name: 'WorkItemStatus',
          declaration: "export type WorkItemStatus = 'open' | 'in_progress' | 'done'",
        },
        {
          name: 'WorkItemId',
          declaration: 'export type WorkItemId = Branded<string, \'WorkItemId\'>',
        },
        {
          name: 'WorkbenchProbeValue',
          declaration: 'export interface WorkbenchProbeValue { readonly domain: string; readonly itemCount: number }',
        },
        {
          name: 'WorkbenchArchivedScope',
          declaration: "export type WorkbenchArchivedScope = 'exclude' | 'include' | 'only'",
        },
        {
          name: 'WorkbenchSearchRequest',
          declaration: 'export interface WorkbenchSearchRequest { readonly workspaceId?: string; readonly query?: string; readonly status?: readonly WorkItemStatus[]; readonly tag?: string; readonly archived?: WorkbenchArchivedScope; readonly offset?: number; readonly limit?: number }',
        },
        {
          name: 'WorkbenchSearchCounts',
          declaration: 'export interface WorkbenchSearchCounts { readonly all: number; readonly active: number; readonly done: number; readonly archived: number }',
        },
        {
          name: 'WorkbenchSearchValue',
          declaration: 'export interface WorkbenchSearchValue { readonly items: readonly WorkItemRecord[]; readonly total: number; readonly counts: WorkbenchSearchCounts }',
        },
        {
          name: 'WorkbenchCreateRequest',
          declaration: 'export interface WorkbenchCreateRequest { readonly workspaceId: string; readonly title: string; readonly desc?: string; readonly tag?: string }',
        },
        {
          name: 'WorkbenchSetDescRequest',
          declaration: "export interface WorkbenchSetDescRequest { readonly workspaceId: string; readonly id: WorkItemId; readonly desc: string; readonly mode?: 'replace' | 'append'; readonly expectedUpdateAt?: string }",
        },
        {
          name: 'WorkbenchUpdateRequest',
          declaration: 'export interface WorkbenchUpdateRequest { readonly workspaceId: string; readonly id: WorkItemId; readonly title?: string; readonly tag?: string; readonly expectedUpdateAt?: string }',
        },
        {
          name: 'WorkbenchRequestCompleteRequest',
          declaration: 'export interface WorkbenchRequestCompleteRequest { readonly workspaceId: string; readonly id: WorkItemId; readonly expectedUpdateAt?: string }',
        },
        {
          name: 'WorkbenchDeleteRequest',
          declaration: 'export interface WorkbenchDeleteRequest { readonly workspaceId: string; readonly id: WorkItemId }',
        },
        {
          name: 'WorkbenchArchiveRequest',
          declaration: 'export interface WorkbenchArchiveRequest { readonly workspaceId: string; readonly id: WorkItemId; readonly archived: boolean; readonly expectedUpdateAt?: string }',
        },
        {
          name: 'WorkbenchWriteValue',
          declaration: "export type WorkbenchWriteValue = { readonly code: 'ok'; readonly item: WorkItemRecord } | { readonly code: 'not_found'; readonly id: string } | { readonly code: 'conflict'; readonly current: WorkItemRecord } | { readonly code: 'invalid'; readonly message: string }",
        },
        {
          name: 'WorkbenchDeleteValue',
          declaration: "export type WorkbenchDeleteValue = { readonly code: 'ok'; readonly id: string } | { readonly code: 'not_found'; readonly id: string } | { readonly code: 'conflict'; readonly current: WorkItemRecord }",
        },
      ],
    }],
    events: [],
    objects: [],
  },
} as const

export default TYPERT
