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
import { z } from 'zod';
import type { WorkItemId, WorkItemRecord } from './types.ts';
/**
 * A completion is only meaningful once the item is done; a record claiming
 * otherwise is corrupt rather than merely unusual, so it rejects the open
 * instead of being normalized on read.
 */
declare const workItemSchema: z.ZodPipe<z.ZodUnknown, z.ZodTransform<WorkItemRecord, unknown>>;
/** Stored work-item value. */
export type StoredWorkItem = z.infer<typeof workItemSchema>;
/**
 * Authoritative work-item storage.
 *
 * `per-record` rather than the default `single`: work items accumulate without
 * bound, and a single-document unit would rewrite the whole collection on every
 * edit. It also scopes version checks per record, so one record written by a
 * newer plugin version cannot make the rest unreadable.
 */
export declare const workbenchDomain: {
    name: string;
    version: number;
    layout: "per-record";
    tables: {
        items: import("@deepseek-ai/dsh-storage-domain").DomainTableSpec<WorkItemId, WorkItemRecord>;
    };
};
export {};
//# sourceMappingURL=storage.d.ts.map