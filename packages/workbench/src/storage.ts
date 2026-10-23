/**
 * Work-item records, tolerant decoding, and the durable Host domain.
 *
 * The stored shape is decoded rather than parsed field-by-field: `decodeWorkItemRecord`
 * is the single place that decides what an on-disk record means, so a schema
 * evolution is one function's problem instead of every reader's. A record that
 * cannot be read at all rejects the open, which is the right default here — a
 * work item is authoritative user data, not disposable derived data, so a
 * malformed one must be noticed rather than silently skipped.
 */
import { z } from 'zod'
import { defineDomain, domainTable } from '@deepseek-ai/dsh-storage-domain'
import type {
  ChangedFile, VerificationEntry, WorkbenchCompletion,
  WorkItemId, WorkItemRecord, WorkItemStatus,
} from './types.ts'

/** A canonical four-digit-year UTC calendar instant, as the rest of DSH stores them. */
const instantSchema = z.iso.datetime({ precision: 3 }).refine(value => !value.startsWith('0000-'), {
  message: 'Expected a canonical four-digit-year UTC calendar instant',
})

const statusSchema = z.enum(['open', 'in_progress', 'done'])

const changedFileSchema = z.object({
  path: z.string().min(1),
  purpose: z.string(),
}).strict()

/** Legacy: records written before `workbench_complete` retired verification still decode. */
const verificationEntrySchema = z.object({
  command: z.string().min(1),
  result: z.enum(['passed', 'failed', 'skipped']),
  note: z.string().optional(),
}).strict()

/**
 * `verification` is optional because records written before `workbench_complete`
 * retired it still carry it; dropping the field from the schema would make those
 * records unreadable. New completions never write it.
 */
const completionSchema = z.object({
  summary: z.string(),
  implementationPath: z.array(z.string()),
  changedFiles: z.array(changedFileSchema),
  verification: z.array(verificationEntrySchema).optional(),
  completedAt: instantSchema,
  completedBy: z.enum(['model', 'user']),
}).strict()

/**
 * The stored work-item shape, kept in step with {@link WorkItemRecord} by the
 * decoder below. `archived` is defaulted rather than required so a record
 * written before archiving existed decodes as active; the default preserves
 * current behaviour, not the value most likely to be wanted later.
 */
const workItemRecordSchema = z.object({
  id: z.string().min(1),
  workspaceId: z.string(),
  workspacePath: z.string(),
  title: z.string(),
  desc: z.string(),
  tag: z.string(),
  status: statusSchema,
  archived: z.boolean().default(false),
  archivedAt: instantSchema.optional(),
  updateAt: instantSchema,
  createdAt: instantSchema,
  completion: completionSchema.optional(),
}).strict()

/** Read one stored record into the public record type, branding the id. */
function decodeWorkItemRecord(value: z.infer<typeof workItemRecordSchema>): WorkItemRecord {
  return {
    id: value.id as WorkItemId,
    workspaceId: value.workspaceId,
    workspacePath: value.workspacePath,
    title: value.title,
    desc: value.desc,
    tag: value.tag,
    status: value.status as WorkItemStatus,
    archived: value.archived,
    ...value.archivedAt === undefined ? {} : { archivedAt: value.archivedAt },
    updateAt: value.updateAt,
    createdAt: value.createdAt,
    ...value.completion === undefined
      ? {}
      : {
        completion: {
          summary: value.completion.summary,
          implementationPath: value.completion.implementationPath,
          changedFiles: value.completion.changedFiles as readonly ChangedFile[],
          ...value.completion.verification === undefined
            ? {}
            : { verification: value.completion.verification as readonly VerificationEntry[] },
          completedAt: value.completion.completedAt,
          completedBy: value.completion.completedBy,
        } satisfies WorkbenchCompletion,
      },
  }
}

/**
 * A stored record routed through {@link decodeWorkItemRecord}, so a zod failure
 * surfaces against the whole record rather than a field list.
 */
const storedRecordSchema = z.unknown().transform((value, context): WorkItemRecord => {
  const parsed = workItemRecordSchema.safeParse(value)
  if (!parsed.success) {
    context.addIssue({ code: 'custom', message: `malformed work item: ${parsed.error.message}` })
    return z.NEVER
  }
  return decodeWorkItemRecord(parsed.data)
})

/**
 * A completion is only meaningful once the item is done; a record claiming
 * otherwise is corrupt rather than merely unusual, so it rejects the open
 * instead of being normalized on read.
 */
const workItemSchema = storedRecordSchema.refine(
  record => record.completion === undefined || record.status === 'done',
  { message: 'Only a done work item may carry a completion' },
)

/** Stored work-item value. */
export type StoredWorkItem = z.infer<typeof workItemSchema>

/**
 * Authoritative work-item storage.
 *
 * `per-record` rather than the default `single`: work items accumulate without
 * bound, and a single-document unit would rewrite the whole collection on every
 * edit. It also scopes version checks per record, so one record written by a
 * newer plugin version cannot make the rest unreadable.
 */
export const workbenchDomain = defineDomain({
  name: 'workbench', version: 1, layout: 'per-record',
  tables: { items: domainTable<WorkItemId, StoredWorkItem>(workItemSchema) },
})
