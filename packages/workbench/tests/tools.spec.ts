/**
 * The two model-facing workbench tools (DESIGN.md §9.34).
 *
 * What is worth pinning here is not `search` or `create` — the Host suites
 * already own those — but the three decisions the tools add on top of them:
 * which workspace a call acts on, what the model is told back, and which
 * failures become tool errors instead of a quietly widened or invented result.
 *
 * The definitions are built through `defineTool`, so `execute` runs the real
 * argument validation and `output.render` runs against the canonical value that
 * the output schema validated. A test can therefore assert the contract the
 * registry enforces, not a private helper's opinion of it.
 *
 * Runs on Node's built-in runner (`pnpm test`), against the built artifacts.
 */
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { validateJsonSchemaValue } from '@deepseek-ai/dsh-tools'
import { workbenchCreateTool, workbenchSearchTool } from '../lib/types/tools.js'
import type {
  WorkbenchCreateRequest, WorkbenchSearchRequest, WorkbenchSearchValue, WorkItemRecord,
} from '../lib/types/types.js'
import WorkbenchService from '../lib/index.js'

/** The workspace the stand-in registry knows, as a tool sees it. */
const WORKSPACE = { id: 'ws-1', path: 'D:\\Workbase\\demo' }

/** A second workspace, so "which one" has a wrong answer available. */
const OTHER = { id: 'ws-2', path: 'D:\\Workbase\\other' }

/** Stands in for the registry lookup a tool call performs. */
interface HostDouble {
  readonly calls: { search: WorkbenchSearchRequest[]; create: WorkbenchCreateRequest[] }
  readonly host: Parameters<typeof workbenchSearchTool>[0]
}

/**
 * A Host double backed by in-memory answers.
 * @param options - what `search` and `create` should answer with.
 * @returns the double plus the calls it observed.
 */
function hostOver(options: {
  search?: (request: WorkbenchSearchRequest) => Promise<WorkbenchSearchValue>
  create?: (request: WorkbenchCreateRequest) => Promise<unknown>
} = {}): HostDouble {
  const calls = { search: [] as WorkbenchSearchRequest[], create: [] as WorkbenchCreateRequest[] }
  const host = {
    search: async (request: WorkbenchSearchRequest) => {
      calls.search.push(request)
      return options.search === undefined ? searchValue([]) : options.search(request)
    },
    create: async (request: WorkbenchCreateRequest) => {
      calls.create.push(request)
      return options.create === undefined
        ? {
          code: 'ok' as const,
          item: record({
            workspaceId: request.workspaceId,
            title: request.title,
            desc: request.desc ?? '',
            tag: request.tag ?? '',
          }),
        }
        : options.create(request)
    },
    workspaceOfSession: (sessionId: string) => sessionId === 'session-1' ? WORKSPACE : undefined,
    workspaceById: (workspaceId: string) => [WORKSPACE, OTHER].find(workspace => workspace.id === workspaceId),
  }
  return { calls, host }
}

/** A stored record, with only the fields a tool answer exposes. */
function record(overrides: Partial<WorkItemRecord> = {}): WorkItemRecord {
  return {
    id: 'item-1',
    workspaceId: WORKSPACE.id,
    workspacePath: WORKSPACE.path,
    title: '一条工作项',
    desc: '',
    tag: '',
    status: 'open',
    archived: false,
    updateAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  } as WorkItemRecord
}

/** What `search` answers with: the page plus the tally the pane prints. */
function searchValue(
  items: readonly WorkItemRecord[],
  counts = { all: items.length, active: items.length, done: 0, archived: 0 },
): WorkbenchSearchValue {
  return { items, total: items.length, counts }
}

/** The execution context a registry hands a tool; only `agent` is read. `null` means no agent. */
function exec(sessionId: string | null = 'session-1'): never {
  return (sessionId === null ? {} : { agent: { id: sessionId } }) as never
}

/** The text a rendered result carries, joined for substring assertions. */
function text(rendered: readonly { type: string; text?: string }[]): string {
  return rendered.map(block => block.text ?? '').join('\n')
}

describe('workbench_search', () => {
  it('scopes a call with no arguments to the calling session’s workspace', async () => {
    const { calls, host } = hostOver()
    const value = await workbenchSearchTool(host).execute({}, exec()) as { workspaceId: string }

    assert.deepEqual(calls.search, [{ workspaceId: WORKSPACE.id }])
    assert.equal(value.workspaceId, WORKSPACE.id, 'the answer names the workspace it read')
  })

  it('forwards every filter the model passes, including an explicit workspace', async () => {
    const { calls, host } = hostOver()
    await workbenchSearchTool(host).execute({
      query: '插件',
      status: ['open', 'in_progress'],
      tag: '工作台插件',
      archived: 'only',
      limit: 5,
      offset: 10,
      workspaceId: OTHER.id,
    }, exec(null))

    assert.deepEqual(calls.search, [{
      workspaceId: OTHER.id,
      query: '插件',
      status: ['open', 'in_progress'],
      tag: '工作台插件',
      archived: 'only',
      limit: 5,
      offset: 10,
    }])
  })

  it('refuses an unknown explicit workspace instead of widening the query', async () => {
    const { calls, host } = hostOver()
    await assert.rejects(
      workbenchSearchTool(host).execute({ workspaceId: 'ws-ghost' }, exec()),
      /unknown workspace 'ws-ghost'/,
    )
    assert.equal(calls.search.length, 0, 'nothing is read when the target cannot be resolved')
  })

  it('refuses to guess when there is no session and no workspace id', async () => {
    const { host } = hostOver()
    await assert.rejects(
      workbenchSearchTool(host).execute({}, exec(null)),
      /needs an owning agent session/,
    )
  })

  it('reports an unattached session rather than another workspace’s items', async () => {
    const { host } = hostOver()
    await assert.rejects(
      workbenchSearchTool(host).execute({}, exec('subagent-session')),
      /is not attached to any workspace/,
    )
  })

  it('returns the row fields the pane shows and nothing else', async () => {
    const item = record({ title: '插件提供工作项查询工具调用', tag: '工作台插件' })
    const { host } = hostOver({
      search: async () => searchValue([item], { all: 1, active: 1, done: 0, archived: 0 }),
    })
    const tool = workbenchSearchTool(host)
    const value = await tool.execute({}, exec())

    assert.deepEqual(value, {
      workspaceId: WORKSPACE.id,
      workspacePath: WORKSPACE.path,
      total: 1,
      counts: { all: 1, active: 1, done: 0, archived: 0 },
      items: [{
        id: 'item-1',
        title: '插件提供工作项查询工具调用',
        desc: '',
        tag: '工作台插件',
        status: 'open',
        archived: false,
        updateAt: '2026-01-01T00:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
      }],
    })
    assert.deepEqual(
      validateJsonSchemaValue(tool.output.schema, value, 'value'),
      [],
      'the returned value satisfies the output schema the registry enforces',
    )
  })

  it('renders the tally and keeps each id on the page', async () => {
    const { host } = hostOver({
      search: async () => searchValue(
        [record({ id: 'a', title: '未完成的事', tag: '工作台插件', desc: '两行\n描述' })],
        { all: 3, active: 2, done: 1, archived: 0 },
      ),
    })
    const tool = workbenchSearchTool(host)
    const value = await tool.execute({}, exec())
    const rendered = text(tool.output.render({}, value as never))

    assert.match(rendered, /2 unfinished, 1 done, 0 archived/)
    assert.match(rendered, /\[ \] 未完成的事/)
    assert.match(rendered, /id: a/)
    assert.match(rendered, /tag: 工作台插件/)
    assert.match(rendered, /两行\n   描述/, 'a multi-line description stays indented under its card')
  })

  it('renders an empty page as a query miss, not an empty workspace', async () => {
    const { host } = hostOver({
      search: async () => searchValue([], { all: 2, active: 2, done: 0, archived: 0 }),
    })
    const tool = workbenchSearchTool(host)
    const value = await tool.execute({ query: '不存在' }, exec())
    const rendered = text(tool.output.render({ query: '不存在' }, value as never))

    assert.match(rendered, /No work items match this query/)
    assert.match(rendered, /2 unfinished/, 'the tally still describes the workspace being searched')
  })
})

describe('workbench_create', () => {
  it('creates in the calling session’s workspace with the arguments given', async () => {
    const { calls, host } = hostOver()
    const value = await workbenchCreateTool(host).execute({
      title: '插件提供工作项创建工具调用',
      desc: '让模型能新建一条待办。',
      tag: '工作台插件',
    }, exec()) as { workspaceId: string; title: string; status: string }

    assert.deepEqual(calls.create, [{
      workspaceId: WORKSPACE.id,
      title: '插件提供工作项创建工具调用',
      desc: '让模型能新建一条待办。',
      tag: '工作台插件',
    }])
    assert.equal(value.workspaceId, WORKSPACE.id)
    assert.equal(value.title, '插件提供工作项创建工具调用')
    assert.equal(value.status, 'open', 'a created item is always open')
  })

  it('omits the optional fields the model left out', async () => {
    const { calls, host } = hostOver()
    await workbenchCreateTool(host).execute({ title: '只有标题' }, exec())
    assert.deepEqual(calls.create, [{ workspaceId: WORKSPACE.id, title: '只有标题' }])
  })

  it('declares a required title, so an empty call never reaches the Host', async () => {
    const { host } = hostOver()
    const tool = workbenchCreateTool(host)
    assert.deepEqual(tool.parameters.required, ['title'])
    await assert.rejects(tool.execute({}, exec()), /title/)
  })

  it('surfaces the Host’s refusal as a tool error', async () => {
    const { host } = hostOver({
      create: async () => ({ code: 'invalid', message: 'title must not be blank' }),
    })
    await assert.rejects(
      workbenchCreateTool(host).execute({ title: '   ' }, exec()),
      /workbench_create was refused: title must not be blank/,
    )
  })

  it('never reports success the record does not back', async () => {
    const { host } = hostOver({
      create: async () => ({ code: 'not_found', id: 'item-1' }),
    })
    await assert.rejects(
      workbenchCreateTool(host).execute({ title: '任务' }, exec()),
      /could not store the item \(not_found\)/,
    )
  })

  it('renders the new card with the id a later call needs', async () => {
    const { host } = hostOver()
    const tool = workbenchCreateTool(host)
    const value = await tool.execute({ title: '新卡片' }, exec())
    const rendered = text(tool.output.render({ title: '新卡片' }, value as never))

    assert.match(rendered, /Created work item item-1 "新卡片"/)
    assert.match(rendered, /D:\\Workbase\\demo/)
    assert.deepEqual(
      validateJsonSchemaValue(tool.output.schema, value, 'value'),
      [],
      'the returned value satisfies the output schema the registry enforces',
    )
  })
})

describe('tool registration', () => {
  it('registers all three model-facing tools on the Host service', () => {
    const registered: string[] = []
    const ctx = {
      reflect: { provide: () => {} },
      inject: (_deps: readonly string[], callback: (scoped: unknown) => void) => {
        callback({
          tools: {
            register: (definition: { name: string }) => {
              registered.push(definition.name)
              return () => {}
            },
          },
        })
      },
      effect: () => {},
      storageDomain: {
        open: () => Promise.resolve({ name: 'workbench', table: () => ({}) }),
      },
      workspaceRegistry: { list: () => [], get: () => undefined },
    }
    new WorkbenchService(ctx as never)
    assert.deepEqual(
      registered.sort(),
      ['workbench_complete', 'workbench_create', 'workbench_search'],
    )
  })
})
