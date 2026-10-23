/**
 * The model-facing workbench tools: `workbench_search` and `workbench_create`.
 *
 * Both are thin projections of the Host service, not a second implementation.
 * The query tool runs the same `search` the pane runs, so a filter the tab
 * understands is a filter the model can ask for, and the two can never rank or
 * count differently; the create tool runs the same `create` the composer runs,
 * so a model-created item is indistinguishable from a user-created one — same
 * `open` status, same ownership check, same record.
 *
 * The one thing the tools add is how a call finds its workspace. A model in a
 * session does not know workspace ids, and asking it to invent one would be a
 * contract it cannot honour, so the default target is resolved from the calling
 * session: the registry's workspace whose `sessionIds` account holds it. The
 * explicit `workspaceId` parameter stays as the escape hatch for a call made
 * outside a session (a subagent, a scripted turn), where that account is absent.
 *
 * `tools.ts` is deliberately pure with respect to the Host: it receives a
 * {@link WorkbenchToolHost} interface and returns `ToolDefinition`s, so the
 * argument, rendering, and error rules can be tested without a storage domain.
 */
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { ToolDefinition } from '@deepseek-ai/dsh-tools'
import type {
  WorkItemStatus, WorkbenchCreateRequest, WorkbenchSearchRequest, WorkbenchSearchValue,
  WorkbenchWriteValue,
} from './types.ts'

/** One workspace a tool call may act on. */
export interface WorkbenchToolWorkspace {
  /** Durable workspace id, in the spelling the Remote contract uses. */
  readonly id: string
  /** Canonical directory path; carried so an answer can say where it came from. */
  readonly path: string
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
  search(request: WorkbenchSearchRequest): Promise<WorkbenchSearchValue>
  /** The same creation path the pane's composer uses. */
  create(request: WorkbenchCreateRequest): Promise<WorkbenchWriteValue>
  /** Workspace whose session account holds `sessionId`, or `undefined` when none does. */
  workspaceOfSession(sessionId: string): WorkbenchToolWorkspace | undefined
  /** Workspace by durable id, for the explicit override. */
  workspaceById(workspaceId: string): WorkbenchToolWorkspace | undefined
}

/** Page size when the caller does not ask for one. Mirrors the Remote's own default. */
const DEFAULT_LIMIT = 50

/** Page ceiling, mirroring the Remote's clamp so the tool cannot promise more. */
const MAX_LIMIT = 200

/** Every status a work item can hold, in the order the contract declares them. */
const STATUSES = ['open', 'in_progress', 'done'] as const

/** One row `workbench_search` returns. */
export interface WorkbenchSearchToolItem {
  readonly id: string
  readonly title: string
  readonly desc: string
  /** `''` means the item has no tag. */
  readonly tag: string
  readonly status: WorkItemStatus
  readonly archived: boolean
  /** ISO-8601 UTC with millisecond precision; the item's current version. */
  readonly updateAt: string
  readonly createdAt: string
}

/** The canonical value `workbench_search` returns. */
export interface WorkbenchSearchToolValue {
  readonly workspaceId: string
  readonly workspacePath: string
  /** Matches before paging, so the model can tell a page from the whole set. */
  readonly total: number
  readonly counts: {
    readonly all: number
    readonly active: number
    readonly done: number
    readonly archived: number
  }
  readonly items: readonly WorkbenchSearchToolItem[]
}

/** The canonical value `workbench_create` returns. */
export interface WorkbenchCreateToolValue {
  readonly id: string
  readonly title: string
  readonly status: WorkItemStatus
  readonly workspaceId: string
  readonly workspacePath: string
  readonly createdAt: string
}

/**
 * Resolve the workspace one call acts on.
 *
 * The explicit id wins when it is present and non-blank; otherwise the session's
 * own workspace is used. Both failures are thrown with an instruction rather
 * than falling back to "every workspace": a query silently widened to other
 * workspaces would report another project's work items as if they were this
 * one's, and a creation silently placed elsewhere is worse still.
 * @param host - the service capabilities.
 * @param requested - the call's `workspaceId` argument, if it passed one.
 * @param sessionId - id of the calling agent's session, if it has one.
 * @returns the target workspace.
 * @throws when an explicit id is unknown, or no id was given and the session
 *   belongs to no workspace.
 */
function resolveWorkspace(
  host: WorkbenchToolHost,
  requested: string | undefined,
  sessionId: string | undefined,
): WorkbenchToolWorkspace {
  const explicit = requested?.trim()
  if (explicit !== undefined && explicit !== '') {
    const found = host.workspaceById(explicit)
    if (found === undefined) {
      throw new Error(
        `workbench: unknown workspace '${explicit}'; omit workspaceId to use the calling session's workspace`,
      )
    }
    return found
  }
  if (sessionId === undefined) {
    throw new Error(
      'workbench: this tool needs an owning agent session; pass workspaceId explicitly when calling from outside one',
    )
  }
  const found = host.workspaceOfSession(sessionId)
  if (found === undefined) {
    throw new Error(
      `workbench: session ${sessionId} is not attached to any workspace; pass workspaceId explicitly`,
    )
  }
  return found
}

/**
 * Render a search page for the model.
 *
 * One line per item, id included, because the id is the only handle a later
 * `workbench_complete` can use — the completion tool echoes it. The tally line
 * is printed even when nothing matches: "0 shown" alone reads as an empty
 * workspace, while the tally says the query is what matched nothing.
 * @param value - the canonical value returned by the tool.
 * @returns model-facing text.
 */
function renderSearch(value: WorkbenchSearchToolValue): string {
  const { counts } = value
  const lines = [
    `Workbench ${value.workspacePath} — ${counts.active} unfinished, ${counts.done} done, ${counts.archived} archived (${counts.all} in the daily lists)`,
  ]
  if (value.items.length === 0) {
    lines.push('No work items match this query.')
    return lines.join('\n')
  }
  const page = value.items.length === value.total
    ? `${value.items.length} matching`
    : `${value.items.length} shown of ${value.total} matching; pass offset to see more`
  lines.push(page, '')
  for (const item of value.items) {
    // `[x]` is the same box the pane draws, so a model and a reader describe a
    // finished item the same way.
    const box = item.status === 'done' ? '[x]' : '[ ]'
    const archived = item.archived ? ' (archived)' : ''
    const meta = [`id: ${item.id}`, `status: ${item.status}`, `updated: ${item.updateAt}`]
    if (item.tag !== '') meta.push(`tag: ${item.tag}`)
    lines.push(`${box} ${item.title}${archived}`, `   ${meta.join(' · ')}`)
    if (item.desc !== '') lines.push(`   ${item.desc.replaceAll('\n', '\n   ')}`)
  }
  return lines.join('\n')
}

/**
 * Render a created item for the model.
 * @param value - the canonical value returned by the tool.
 * @returns model-facing text.
 */
function renderCreate(value: WorkbenchCreateToolValue): string {
  return `Created work item ${value.id} "${value.title}" in ${value.workspacePath} (status: ${value.status}). It is now in the workbench, owned by this workspace.`
}

/**
 * Build `workbench_search`.
 * @param host - the service capabilities.
 * @returns the registry-ready tool definition.
 */
export function workbenchSearchTool(host: WorkbenchToolHost): ToolDefinition {
  return defineTool({
    name: 'workbench_search',
    description: "Query the workbench work items of the calling session's workspace — the per-workspace todos the user keeps in the right sidebar. Read-only. Returns the page plus the workspace's tier counts, and each row carries the id that workbench_complete needs. An empty query lists everything; status [\"open\",\"in_progress\"] lists only unfinished work.",
    parameters: {
      query: {
        type: 'string',
        description: 'Fuzzy text matched against title, description, and tag. Omit or leave blank to list every item.',
      },
      status: {
        type: 'array',
        items: { type: 'string', enum: STATUSES },
        description: 'Restrict to these statuses. Pass ["open","in_progress"] for unfinished work only, ["done"] for finished work only; omit for all of them.',
      },
      tag: {
        type: 'string',
        description: 'Exact tag match (the card\'s 项目 value). Omit for any tag.',
      },
      archived: {
        type: 'string',
        enum: ['exclude', 'include', 'only'],
        description: 'Archived scope. Defaults to exclude: archived items are out of the daily lists. Use only to browse the archive.',
      },
      limit: {
        type: 'integer',
        description: `Page size from 1 to ${MAX_LIMIT}. Defaults to ${DEFAULT_LIMIT}.`,
      },
      offset: {
        type: 'integer',
        description: 'Rows to skip in the scored, most-recently-updated-first order.',
      },
      workspaceId: {
        type: 'string',
        description: "Durable workspace id to query instead of the calling session's workspace.",
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          workspaceId: { type: 'string', required: true },
          workspacePath: { type: 'string', required: true },
          total: { type: 'integer', required: true },
          counts: {
            type: 'object',
            required: true,
            additionalProperties: false,
            properties: {
              all: { type: 'integer', required: true },
              active: { type: 'integer', required: true },
              done: { type: 'integer', required: true },
              archived: { type: 'integer', required: true },
            },
          },
          items: {
            type: 'array',
            required: true,
            items: {
              type: 'object',
              additionalProperties: false,
              properties: {
                id: { type: 'string', required: true },
                title: { type: 'string', required: true },
                desc: { type: 'string', required: true },
                tag: { type: 'string', required: true },
                status: { type: 'string', required: true, enum: STATUSES },
                archived: { type: 'boolean', required: true },
                updateAt: { type: 'string', required: true },
                createdAt: { type: 'string', required: true },
              },
            },
          },
        },
      },
      render: (_args, value) => [{ type: 'text', text: renderSearch(value) }],
    },
    // A query reads a snapshot and writes nothing, so overlapping it with its
    // siblings is safe; only the create tool below takes the write path.
    isConcurrencySafe: () => true,
    execute: async (args, exec) => {
      const workspace = resolveWorkspace(
        host,
        args.workspaceId,
        exec.agent === undefined ? undefined : String(exec.agent.id),
      )
      const request: WorkbenchSearchRequest = {
        workspaceId: workspace.id,
        ...args.query === undefined ? {} : { query: args.query },
        ...args.status === undefined ? {} : { status: args.status },
        ...args.tag === undefined ? {} : { tag: args.tag },
        ...args.archived === undefined ? {} : { archived: args.archived },
        ...args.limit === undefined ? {} : { limit: args.limit },
        ...args.offset === undefined ? {} : { offset: args.offset },
      }
      const value = await host.search(request)
      return {
        workspaceId: workspace.id,
        workspacePath: workspace.path,
        total: value.total,
        counts: value.counts,
        items: value.items.map(item => ({
          id: String(item.id),
          title: item.title,
          desc: item.desc,
          tag: item.tag,
          status: item.status,
          archived: item.archived,
          updateAt: item.updateAt,
          createdAt: item.createdAt,
        })),
      }
    },
  })
}

/**
 * Build `workbench_create`.
 * @param host - the service capabilities.
 * @returns the registry-ready tool definition.
 */
export function workbenchCreateTool(host: WorkbenchToolHost): ToolDefinition {
  return defineTool({
    name: 'workbench_create',
    description: "Create one work item in the calling session's workspace — a new card in the right-sidebar workbench. Always starts in status open; status, archive state, and completion are not inputs. Search first when the task may already be recorded, so the same work does not get two cards.",
    parameters: {
      title: {
        type: 'string',
        required: true,
        description: 'The card title — one line naming the work, in the language the user writes.',
      },
      desc: {
        type: 'string',
        description: 'Optional description shown on the expanded card.',
      },
      tag: {
        type: 'string',
        description: 'Optional single free-text tag (the card\'s 项目 value).',
      },
      workspaceId: {
        type: 'string',
        description: "Durable workspace id to create in instead of the calling session's workspace.",
      },
    },
    output: {
      schema: {
        type: 'object',
        additionalProperties: false,
        properties: {
          id: { type: 'string', required: true },
          title: { type: 'string', required: true },
          status: { type: 'string', required: true, enum: STATUSES },
          workspaceId: { type: 'string', required: true },
          workspacePath: { type: 'string', required: true },
          createdAt: { type: 'string', required: true },
        },
      },
      render: (_args, value) => [{ type: 'text', text: renderCreate(value) }],
    },
    execute: async (args, exec) => {
      const workspace = resolveWorkspace(
        host,
        args.workspaceId,
        exec.agent === undefined ? undefined : String(exec.agent.id),
      )
      const request: WorkbenchCreateRequest = {
        workspaceId: workspace.id,
        title: args.title,
        ...args.desc === undefined ? {} : { desc: args.desc },
        ...args.tag === undefined ? {} : { tag: args.tag },
      }
      const result = await host.create(request)
      if (result.code === 'invalid') {
        throw new Error(`workbench_create was refused: ${result.message}`)
      }
      if (result.code !== 'ok') {
        // `create` has no pre-existing item, so `not_found`/`conflict` mean the
        // storage layer answered a question this call never asked. Report it
        // rather than inventing a success the record does not back.
        throw new Error(`workbench_create could not store the item (${result.code})`)
      }
      return {
        id: String(result.item.id),
        title: result.item.title,
        status: result.item.status,
        workspaceId: result.item.workspaceId,
        workspacePath: result.item.workspacePath,
        createdAt: result.item.createdAt,
      }
    },
  })
}
