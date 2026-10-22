import { queryWords, scoreItem } from "./fuzzy.js";
import { planRequestComplete } from "./state.js";
import { WorkspaceId } from "@deepseek-ai/dsh-workspace";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
import { defineTool } from "@deepseek-ai/dsh-tools";
import { z } from "zod";
import { defineDomain, domainTable } from "@deepseek-ai/dsh-storage-domain";
//#region packages/workbench/lib/types/completion.js
/**
* Decide whether a completion may be written for one record.
*
* Two rules meet here, and they are about different things. The *status* is
* terminal: writing a completion is the only transition into `done` and nothing
* assigns a status back (DESIGN.md §4.5), so this never re-opens an item. The
* *record* is last-wins: a later call for the same item replaces the earlier one
* (DESIGN.md §12.2), and the replacement may only add — a submission that drops
* a file the earlier record names, or a command it ran, is refused, because a
* record of fact must never become less true than it was.
*
* Archiving is deliberately not a refusal: an archived item's workspace is gone,
* but the item is still a live record and the write-back is still the only thing
* that can finish it (DESIGN.md §4.7).
* @param record - the record as of the queue slot.
* @param input - the completion the model submitted.
* @returns the plan the caller must follow.
*/
function planCompletion(record, input) {
	const earlier = record.completion;
	if (earlier === void 0) return {
		kind: "write",
		replaced: false
	};
	const dropped = droppedEntries(earlier, input);
	if (dropped.files.length > 0 || dropped.commands.length > 0) return {
		kind: "refuse",
		message: droppedEntriesMessage(earlier, dropped)
	};
	return {
		kind: "write",
		replaced: true
	};
}
/**
* Stamp the model's input into a stored completion.
*
* The two stamped fields are the executor's, never the model's: a model that
* could name its own `completedAt` could also claim a human marked the item done.
* @param input - the validated fields the model submitted.
* @param at - the instant to stamp; injectable so the decision is testable.
* @returns the completion as the record stores it.
*/
function completionFromInput(input, at = (/* @__PURE__ */ new Date()).toISOString()) {
	return {
		summary: input.summary,
		implementationPath: input.implementationPath,
		changedFiles: input.changedFiles,
		verification: input.verification,
		completedAt: at,
		completedBy: "model"
	};
}
/**
* The model-facing refusal for empty fields, or `undefined` when the input is usable.
*
* The tool schema already types every field, so this is the content check the
* schema cannot express: a whitespace-only summary is a write-back that records
* nothing while claiming to be one.
* @param input - the raw submitted fields.
* @returns the error message, or `undefined` when they may be recorded.
*/
function completionInputError(input) {
	if (input.summary.trim() === "") return "workbench_complete requires a non-empty summary: it is the only thing the user reads back";
}
/**
* Entries an earlier completion carries that the submitted one would drop.
*
* Changed-file paths and verification commands are facts about what the task
* did, so a replacement keeps every one of them; implementation steps are prose
* and are not compared (DESIGN.md §4.4). A later call that quietly omits a file
* would leave the record *less* true than before, which is the one direction a
* record of fact must never move.
* @param earlier - the completion already stored for this item.
* @param next - the lists this call submits.
* @returns the dropped paths and commands, each empty when nothing is dropped.
*/
function droppedEntries(earlier, next) {
	const paths = new Set(next.changedFiles.map((file) => file.path));
	const commands = new Set(next.verification.map((item) => item.command));
	return {
		files: earlier.changedFiles.filter((file) => !paths.has(file.path)).map((file) => file.path),
		commands: earlier.verification.filter((item) => !commands.has(item.command)).map((item) => item.command)
	};
}
/**
* The refusal for a call that would drop recorded entries.
* @param earlier - the completion already stored for this item.
* @param dropped - the paths and commands the submitted record omits.
* @returns the model-facing message, naming only the lists that lost entries.
*/
function droppedEntriesMessage(earlier, dropped) {
	const missing = [];
	if (dropped.files.length > 0) missing.push(`files ${dropped.files.join(", ")}`);
	if (dropped.commands.length > 0) missing.push(`commands ${dropped.commands.join(", ")}`);
	return `workbench_complete would drop entries the earlier record for this item carries: ${missing.join("; ")}. Pass the whole-task record — a replacement keeps every file the task changed and every command it ran. The earlier record, written at ${earlier.completedAt}, said: ${earlier.summary}`;
}
//#endregion
//#region packages/workbench/lib/types/storage.js
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
/** A canonical four-digit-year UTC calendar instant, as the rest of DSH stores them. */
const instantSchema = z.iso.datetime({ precision: 3 }).refine((value) => !value.startsWith("0000-"), { message: "Expected a canonical four-digit-year UTC calendar instant" });
const statusSchema = z.enum([
	"open",
	"in_progress",
	"done"
]);
const changedFileSchema = z.object({
	path: z.string().min(1),
	purpose: z.string()
}).strict();
const verificationEntrySchema = z.object({
	command: z.string().min(1),
	result: z.enum([
		"passed",
		"failed",
		"skipped"
	]),
	note: z.string().optional()
}).strict();
/**
* `archived` is defaulted rather than required so a record written before
* archiving existed decodes as active. The default is the value that preserves
* current behaviour, not the value that is most likely to be wanted later.
*/
const completionSchema = z.object({
	summary: z.string(),
	implementationPath: z.array(z.string()),
	changedFiles: z.array(changedFileSchema),
	verification: z.array(verificationEntrySchema),
	completedAt: instantSchema,
	completedBy: z.enum(["model", "user"])
}).strict();
/** The stored work-item shape, kept in step with {@link WorkItemRecord} by the decoder below. */
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
	completion: completionSchema.optional()
}).strict();
/** Read one stored record into the public record type, branding the id. */
function decodeWorkItemRecord(value) {
	return {
		id: value.id,
		workspaceId: value.workspaceId,
		workspacePath: value.workspacePath,
		title: value.title,
		desc: value.desc,
		tag: value.tag,
		status: value.status,
		archived: value.archived,
		...value.archivedAt === void 0 ? {} : { archivedAt: value.archivedAt },
		updateAt: value.updateAt,
		createdAt: value.createdAt,
		...value.completion === void 0 ? {} : { completion: {
			summary: value.completion.summary,
			implementationPath: value.completion.implementationPath,
			changedFiles: value.completion.changedFiles,
			verification: value.completion.verification,
			completedAt: value.completion.completedAt,
			completedBy: value.completion.completedBy
		} }
	};
}
/**
* A completion is only meaningful once the item is done; a record claiming
* otherwise is corrupt rather than merely unusual, so it rejects the open
* instead of being normalized on read.
*/
const workItemSchema = z.unknown().transform((value, context) => {
	const parsed = workItemRecordSchema.safeParse(value);
	if (!parsed.success) {
		context.addIssue({
			code: "custom",
			message: `malformed work item: ${parsed.error.message}`
		});
		return z.NEVER;
	}
	return decodeWorkItemRecord(parsed.data);
}).refine((record) => record.completion === void 0 || record.status === "done", { message: "Only a done work item may carry a completion" });
/**
* Authoritative work-item storage.
*
* `per-record` rather than the default `single`: work items accumulate without
* bound, and a single-document unit would rewrite the whole collection on every
* edit. It also scopes version checks per record, so one record written by a
* newer plugin version cannot make the rest unreadable.
*/
const workbenchDomain = defineDomain({
	name: "workbench",
	version: 1,
	layout: "per-record",
	tables: { items: domainTable(workItemSchema) }
});
//#endregion
//#region packages/workbench/lib/types/index.js
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) {
			if (kind === "field") initializers.unshift(_);
			else descriptor[key] = _;
		}
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/** Search page size when the caller does not ask for one. */
const DEFAULT_LIMIT = 50;
/** Search page ceiling, so one query cannot stream an unbounded collection. */
const MAX_LIMIT = 200;
/** Separator used by `setDesc`'s append mode between the old and new text. */
const APPEND_SEPARATOR = "\n\n";
/**
* Internal signal that a queued compare-and-swap lost its race.
*
* Thrown from inside `KvTable.update`'s transform, which runs synchronously
* inside the domain's write queue and is never wrapped in a try/catch by the
* storage layer — so throwing aborts the write before anything is persisted.
* That is the whole point: a rejected CAS must not touch the record.
*
* Never escapes this module; `mutate` converts it back into the `conflict`
* branch of {@link WorkbenchWriteValue}.
*/
var WorkbenchConflict = class extends Error {
	/** The record as it stood at the queue slot, which is what the caller lost to. */
	current;
	/**
	* @param current - record observed at the queue slot.
	*/
	constructor(current) {
		super("work item changed since it was read");
		this.name = "WorkbenchConflict";
		this.current = current;
	}
};
/**
* Internal signal that a queued `requestComplete` reached its slot on an edge
* that must not write.
*
* The plan is decided from a read *before* the queue, and a record can move in
* between: another session can advance it to `in_progress`, and — once the model
* can complete items (P5) — it can become `done`. Writing on either would be
* wrong, and the second one badly: it would drag a completed item back to
* `in_progress`, an edge §4.5 says does not exist. The slot is the only read
* that is atomic with the write, so the plan is re-decided there and thrown out
* through the same abort mechanism as {@link WorkbenchConflict} — a throw inside
* the transform is what stops the write from being persisted.
*/
var WorkbenchEdgeLost = class extends Error {
	/** The plan as re-decided at the queue slot; never `advance`. */
	plan;
	/** The record as it stood at the queue slot. */
	current;
	/**
	* @param plan - the retry or refuse edge observed at the slot.
	* @param current - record observed at the slot.
	*/
	constructor(plan, current) {
		super(plan.kind === "refuse" ? plan.message : "work item is already in progress");
		this.name = "WorkbenchEdgeLost";
		this.plan = plan;
		this.current = current;
	}
};
/** Work-item service: the durable authority behind the workbench tab. */
let WorkbenchService = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _probe_decorators;
	let _search_decorators;
	let _create_decorators;
	let _setDesc_decorators;
	let _update_decorators;
	let _requestComplete_decorators;
	let _delete_decorators;
	return class WorkbenchService extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_probe_decorators = [Remote("probe")];
			_search_decorators = [Remote("search")];
			_create_decorators = [Remote("create")];
			_setDesc_decorators = [Remote("setDesc")];
			_update_decorators = [Remote("update")];
			_requestComplete_decorators = [Remote("requestComplete")];
			_delete_decorators = [Remote("delete")];
			__esDecorate(this, null, _probe_decorators, {
				kind: "method",
				name: "probe",
				static: false,
				private: false,
				access: {
					has: (obj) => "probe" in obj,
					get: (obj) => obj.probe
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _search_decorators, {
				kind: "method",
				name: "search",
				static: false,
				private: false,
				access: {
					has: (obj) => "search" in obj,
					get: (obj) => obj.search
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _create_decorators, {
				kind: "method",
				name: "create",
				static: false,
				private: false,
				access: {
					has: (obj) => "create" in obj,
					get: (obj) => obj.create
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _setDesc_decorators, {
				kind: "method",
				name: "setDesc",
				static: false,
				private: false,
				access: {
					has: (obj) => "setDesc" in obj,
					get: (obj) => obj.setDesc
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _update_decorators, {
				kind: "method",
				name: "update",
				static: false,
				private: false,
				access: {
					has: (obj) => "update" in obj,
					get: (obj) => obj.update
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _requestComplete_decorators, {
				kind: "method",
				name: "requestComplete",
				static: false,
				private: false,
				access: {
					has: (obj) => "requestComplete" in obj,
					get: (obj) => obj.requestComplete
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _delete_decorators, {
				kind: "method",
				name: "delete",
				static: false,
				private: false,
				access: {
					has: (obj) => "delete" in obj,
					get: (obj) => obj.delete
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		static inject = ["storageDomain", "workspaceRegistry"];
		/**
		* Opened once, at construction. Every Remote awaits this before touching
		* storage, so a domain that fails to open fails every call with one cause
		* rather than each call opening its own view of the medium.
		*/
		ready = __runInitializers(this, _instanceExtraInitializers);
		/**
		* The `updateAt` each item was at when the user last asked for a write-back,
		* keyed by item id.
		*
		* The write-back is version-guarded so it cannot overwrite an edit the user
		* made after clicking (DESIGN.md §11.4): the tool carries no version of its
		* own — the model has no way to know one — so the Host remembers the version
		* the *request* observed and hands it to the same CAS the Remote writes use.
		* A model that finishes the work late loses to a later user edit, which is the
		* correct direction: the user's own text is never silently replaced.
		*/
		writeBacks = /* @__PURE__ */ new Map();
		/**
		* @param ctx - Host services owning the storage hub and the workspace registry.
		*/
		constructor(ctx) {
			super(ctx, "workbench");
			this.ready = ctx.storageDomain.open(workbenchDomain);
			this.ready.catch(() => {});
			ctx.effect(() => () => {
				this.ready.then((domain) => domain.close(), () => {});
			}, "workbench: storage domain");
			ctx.inject(["tools"], (scoped) => {
				this.registerCompleteTool(scoped);
			});
		}
		/**
		* Register `workbench_complete`: the one model-facing tool of the write-back
		* route (DESIGN.md §11.3, §13.5).
		*
		* The tool is the *second half* of a two-part flow. The tab's click only
		* advances the item to `in_progress` and queues a user turn asking for the
		* summary; the model answers that turn by calling this tool, which is the only
		* thing that may write `done` and a completion record (DESIGN.md §4.5). A model
		* that never calls it costs nothing: the item stays `in_progress` with no
		* record and no fake completion, and the user can ask again.
		*
		* The tool writes to the same durable record every Remote writes to, and
		* appends no session event. That is a deliberate deviation from the design's
		* first sketch (DESIGN.md §11.6): a session event type declared outside this
		* repository is absent from the generated `KNOWN_SESSION_EVENT_TYPES`, and the
		* persistence read path refuses to load a log carrying an unknown type that is
		* not marked `ignorable` — a marker `Session.append()` cannot set. The record
		* is the authority anyway (§13.2), so the write-back writes it and the tab
		* re-reads it when the session settles.
		* @param ctx - a Context with `tools` available.
		*/
		registerCompleteTool(ctx) {
			ctx.tools.register(defineTool({
				name: "workbench_complete",
				description: "Write the completion record for one workbench work item. Echo the id from the request exactly. Call only after the task is actually done, and report only verification commands that were actually run. Each call records the whole task: a later call for the same id replaces the earlier record, so rewrite the summary, the implementation path, the changed files, and the verification to cover everything the task did — every requirement and every later correction — not only the latest change. A replacement that drops a file or a command the earlier record already carries is rejected.",
				parameters: {
					id: {
						type: "string",
						required: true,
						description: "Work item id, echoed from the request."
					},
					summary: {
						type: "string",
						required: true,
						description: "Complete result summary for the whole task, not only the latest change."
					},
					implementationPath: {
						type: "array",
						required: true,
						items: { type: "string" },
						description: "Every implementation step of the task, not only the latest change."
					},
					changedFiles: {
						type: "array",
						required: true,
						description: "Every file the task changed; a later call keeps the earlier entries.",
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								path: {
									type: "string",
									required: true
								},
								purpose: {
									type: "string",
									required: true
								}
							}
						}
					},
					verification: {
						type: "array",
						required: true,
						description: "Every command the task actually ran; a later call keeps the earlier entries.",
						items: {
							type: "object",
							additionalProperties: false,
							properties: {
								command: {
									type: "string",
									required: true
								},
								result: {
									type: "string",
									required: true,
									enum: [
										"passed",
										"failed",
										"skipped"
									]
								},
								note: { type: "string" }
							}
						}
					}
				},
				output: {
					schema: {
						type: "object",
						additionalProperties: false,
						properties: {
							id: {
								type: "string",
								required: true
							},
							written: {
								type: "boolean",
								required: true
							},
							replaced: {
								type: "boolean",
								required: true
							},
							replacedAt: { type: "string" },
							replacedSummary: { type: "string" }
						}
					},
					render: (_args, value) => [{
						type: "text",
						text: value.replaced ? `Recorded the completion for work item ${value.id}, replacing the record written at ${value.replacedAt}. Make sure it covers the whole task: if the summary or any list describes only the latest change, call workbench_complete again with the complete record. The replaced record said: ${value.replacedSummary}` : `Recorded the completion for work item ${value.id}.`
					}]
				},
				execute: async (args, exec) => {
					const id = args.id.trim();
					if (id === "") throw new Error("workbench_complete requires a non-empty id");
					if (!exec.agent) throw new Error("workbench_complete requires an owning agent session");
					const input = {
						summary: args.summary.trim(),
						implementationPath: args.implementationPath,
						changedFiles: args.changedFiles,
						verification: args.verification
					};
					const empty = completionInputError(input);
					if (empty !== void 0) throw new Error(empty);
					const observed = (await this.table()).get(id);
					if (observed === void 0) throw new Error(`unknown work item ${id}; use the id the request named`);
					const plan = planCompletion(observed, input);
					if (plan.kind === "refuse") throw new Error(plan.message);
					const earlier = observed.completion;
					const expectedUpdateAt = this.writeBacks.get(id);
					this.writeBacks.delete(id);
					const result = await this.mutate({
						id: observed.id,
						workspaceId: observed.workspaceId,
						...expectedUpdateAt === void 0 ? {} : { expectedUpdateAt }
					}, (current) => ({
						...current,
						status: "done",
						completion: completionFromInput(input)
					}));
					if (result.code === "conflict") throw new Error(`work item ${id} was edited after this write-back was requested, so the completion was not recorded; the edit stands and the item is still open for another request`);
					if (result.code === "not_found") throw new Error(`work item ${id} was deleted before the completion could be recorded`);
					if (result.code === "invalid") throw new Error(result.message);
					exec.concludeTurn();
					return {
						id,
						written: true,
						replaced: plan.replaced,
						...earlier === void 0 ? {} : {
							replacedAt: earlier.completedAt,
							replacedSummary: earlier.summary
						}
					};
				}
			}));
		}
		/**
		* Remember the version a write-back request observed.
		*
		* Called on both edges of the request, because the guard has to cover the
		* version the *client* last saw: the advance edge re-stamps `updateAt` as it
		* writes, and the retry edge writes nothing at all, so in both cases the
		* version the model's completion must still match is the one the request
		* returned (DESIGN.md §4.5, §11.4).
		* @param id - the item the user asked about.
		* @param updateAt - the version that request observed.
		*/
		armWriteBack(id, updateAt) {
			this.writeBacks.set(id, updateAt);
		}
		/**
		* Report that the Host half is mounted and its domain is open.
		*
		* The tab body calls this on mount so an installed-but-broken plugin says so
		* in the pane, rather than rendering an empty list that reads as "no work
		* items" and sends the user looking in the wrong place.
		* @returns the open domain's name and how many items it holds.
		* @throws when the domain could not be opened.
		*/
		async probe() {
			const domain = await this.ready;
			return {
				domain: domain.name,
				itemCount: domain.table("items").size
			};
		}
		/**
		* Fuzzy-query work items, ranked by the three-tier score in `fuzzy.ts`.
		*
		* Reads a snapshot: `entries()` is documented as stable while queued writes
		* land, so one query sees one consistent collection rather than a list that
		* changes mid-scan.
		* @param request - filters, paging, and the optional query text.
		* @returns the page plus the unpaged hit count.
		* @throws when the domain could not be opened.
		*/
		async search(request) {
			const table = await this.table();
			const words = queryWords(request.query ?? "");
			const wanted = request.status === void 0 ? void 0 : new Set(request.status);
			const hits = [];
			const archived = request.archived ?? "exclude";
			let activeCount = 0;
			let doneCount = 0;
			let archivedCount = 0;
			for (const [, record] of table.entries()) {
				if (request.workspaceId !== void 0 && record.workspaceId !== request.workspaceId) continue;
				if (record.archived) archivedCount++;
				else if (record.status === "done") doneCount++;
				else activeCount++;
				if (archived === "exclude" && record.archived) continue;
				if (archived === "only" && !record.archived) continue;
				if (wanted !== void 0 && !wanted.has(record.status)) continue;
				if (request.tag !== void 0 && record.tag !== request.tag) continue;
				const score = scoreItem(request.query ?? "", record);
				if (words.length > 0 && score === 0) continue;
				hits.push({
					item: record,
					score
				});
			}
			hits.sort((left, right) => {
				if (left.score !== right.score) return right.score - left.score;
				if (left.item.updateAt === right.item.updateAt) return 0;
				return left.item.updateAt < right.item.updateAt ? 1 : -1;
			});
			const offset = Math.max(0, request.offset ?? 0);
			const limit = Math.min(MAX_LIMIT, Math.max(1, request.limit ?? DEFAULT_LIMIT));
			return {
				items: hits.slice(offset, offset + limit).map((hit) => hit.item),
				total: hits.length,
				counts: {
					all: activeCount + doneCount,
					active: activeCount,
					done: doneCount,
					archived: archivedCount
				}
			};
		}
		/**
		* Create one work item.
		*
		* Creation is always `open`: `status` is not an input, because `in_progress`
		* and `done` are reached only through the write-back path (DESIGN.md §4.5).
		* @param request - owning workspace and the initial fields.
		* @returns the stored record, or `invalid` when an input cannot be honored.
		* @throws when the domain could not be opened.
		*/
		async create(request) {
			const workspacePath = this.resolveWorkspace(request.workspaceId);
			if (workspacePath === void 0) return {
				code: "invalid",
				message: `unknown workspace '${request.workspaceId}'`
			};
			const title = request.title.trim();
			if (title === "") return {
				code: "invalid",
				message: "title must not be blank"
			};
			const now = nowInstant();
			const record = {
				id: crypto.randomUUID(),
				workspaceId: request.workspaceId,
				workspacePath,
				title,
				desc: request.desc ?? "",
				tag: request.tag ?? "",
				status: "open",
				archived: false,
				updateAt: now,
				createdAt: now
			};
			await (await this.table()).put(record.id, record);
			return {
				code: "ok",
				item: record
			};
		}
		/**
		* Replace or append one work item's description.
		* @param request - target item, new text, and optional mode and version.
		* @returns the stored record, `conflict` against a stale version, or `invalid`.
		* @throws when the domain could not be opened.
		*/
		async setDesc(request) {
			const invalid = this.rejectUnknownWorkspace(request.workspaceId);
			if (invalid !== void 0) return invalid;
			return this.mutate(request, (current) => ({
				...current,
				desc: request.mode === "append" && current.desc !== "" ? `${current.desc}${APPEND_SEPARATOR}${request.desc}` : request.desc
			}));
		}
		/**
		* Change one work item's title and tag.
		*
		* Requesting neither is rejected rather than treated as a no-op: a silent
		* success would still have to either bump `updateAt` (changing a record the
		* caller did not ask to change) or not bump it (making `update` the one write
		* that may not write), and both readings are wrong.
		* @param request - target item and the fields to change.
		* @returns the stored record, `conflict` against a stale version, or `invalid`.
		* @throws when the domain could not be opened.
		*/
		async update(request) {
			const invalid = this.rejectUnknownWorkspace(request.workspaceId);
			if (invalid !== void 0) return invalid;
			const title = request.title?.trim();
			if (title === "") return {
				code: "invalid",
				message: "title must not be blank"
			};
			if (title === void 0 && request.tag === void 0) return {
				code: "invalid",
				message: "update requires title or tag"
			};
			return this.mutate(request, (current) => ({
				...current,
				...title === void 0 ? {} : { title },
				...request.tag === void 0 ? {} : { tag: request.tag }
			}));
		}
		/**
		* Ask for a write-back on one work item: the `open → in_progress` edge, and its
		* retry (DESIGN.md §4.5).
		*
		* It advances intent, never outcome. No summary is produced here, and no status
		* other than `in_progress` is reachable from it: `done` stays the monopoly of a
		* successful `workbench_complete` (P5), which is what makes a completed item a
		* fact rather than a claim.
		*
		* The retry edge is idempotent by construction — an item already in progress is
		* returned unwritten, with `expectedUpdateAt` ignored — so pressing the control
		* twice neither conflicts with the first press nor moves `updateAt`, and a
		* failed model turn can be retried without the list pretending to be fresher
		* than it is. Only the writing edge compares versions, which is also why a
		* genuine race there is still reported as `conflict` rather than merged.
		* @param request - target item and the version the caller last saw.
		* @returns the record after the edge, `conflict` on the writing edge, or `invalid`.
		* @throws when the domain could not be opened.
		*/
		async requestComplete(request) {
			const invalid = this.rejectUnknownWorkspace(request.workspaceId);
			if (invalid !== void 0) return invalid;
			const table = await this.table();
			const key = request.id;
			const observed = table.get(key);
			if (observed === void 0 || observed.workspaceId !== request.workspaceId) return {
				code: "not_found",
				id: request.id
			};
			const plan = planRequestComplete(observed.status);
			if (plan.kind === "refuse") return {
				code: "invalid",
				message: plan.message
			};
			if (plan.kind === "retry") {
				this.armWriteBack(request.id, observed.updateAt);
				return {
					code: "ok",
					item: observed
				};
			}
			const result = await this.mutate(request, (current) => {
				const atSlot = planRequestComplete(current.status);
				if (atSlot.kind !== "advance") throw new WorkbenchEdgeLost(atSlot, current);
				return {
					...current,
					status: "in_progress"
				};
			});
			if (result.code === "ok") this.armWriteBack(request.id, result.item.updateAt);
			return result;
		}
		/**
		* Delete one work item.
		*
		* Deletion is a real removal, not the archiving of §4.7: archiving preserves
		* an item whose *workspace* disappeared, while this is the user discarding an
		* item they asked for.
		*
		* Unlike the other writes there is no workspace guard, because
		* {@link WorkbenchDeleteValue} has no `invalid` arm. An unresolvable
		* `workspaceId` therefore falls out of the ownership check below as
		* `not_found` — which is the more accurate answer anyway: if the workspace
		* does not exist, no item can belong to it, so the item is absent rather than
		* mis-specified.
		* @param request - target item.
		* @returns the deleted id, or `not_found`.
		* @throws when the domain could not be opened.
		*/
		async delete(request) {
			const table = await this.table();
			const current = table.get(request.id);
			if (current === void 0 || current.workspaceId !== request.workspaceId) return {
				code: "not_found",
				id: request.id
			};
			await table.delete(request.id);
			this.writeBacks.delete(request.id);
			return {
				code: "ok",
				id: request.id
			};
		}
		/**
		* The open domain's item table.
		* @returns the table handle.
		* @throws when the domain could not be opened.
		*/
		async table() {
			return (await this.ready).table("items");
		}
		/**
		* Canonical path of a workspace, or `undefined` when the registry does not
		* know it.
		*
		* Work-item writes are scoped by this check (DESIGN.md §4.1) so a forged or
		* stale `workspaceId` cannot create records that no workspace can ever show.
		* @param workspaceId - raw id from the request.
		* @returns the workspace's canonical path.
		*/
		resolveWorkspace(workspaceId) {
			return this.ctx.workspaceRegistry.get(WorkspaceId(workspaceId))?.path;
		}
		/**
		* Turn an unresolvable workspace into the `invalid` branch, if it is one.
		* @param workspaceId - raw id from the request.
		* @returns the `invalid` value, or `undefined` when the workspace is known.
		*/
		rejectUnknownWorkspace(workspaceId) {
			if (this.resolveWorkspace(workspaceId) !== void 0) return void 0;
			return {
				code: "invalid",
				message: `unknown workspace '${workspaceId}'`
			};
		}
		/**
		* Apply one compare-and-swap transform to a work item.
		*
		* Two checks, because they answer different questions. The read outside the
		* queue gives the fast, ordinary answers (`not_found`, `conflict`) without
		* paying for a queued write. The check *inside* the transform is the one that
		* is actually atomic: it sees the record as of its queue slot, so a writer
		* that landed in between cannot be clobbered by a stale expectation.
		* @param request - target item, optional expected version.
		* @param transform - next-record builder, given the record as of the queue slot.
		*   It may abort the write by throwing {@link WorkbenchConflict} or
		*   {@link WorkbenchEdgeLost}; both are turned back into a result below.
		* @returns the write outcome.
		* @throws when the domain could not be opened, or the failure is unexpected.
		*/
		async mutate(request, transform) {
			const table = await this.table();
			const key = request.id;
			const current = table.get(key);
			if (current === void 0 || current.workspaceId !== request.workspaceId) return {
				code: "not_found",
				id: request.id
			};
			const expected = request.expectedUpdateAt;
			if (expected !== void 0 && current.updateAt !== expected) return {
				code: "conflict",
				current
			};
			const now = nowInstant();
			try {
				return {
					code: "ok",
					item: await table.update(key, (record) => {
						if (expected !== void 0 && record.updateAt !== expected) throw new WorkbenchConflict(record);
						return {
							...transform(record),
							updateAt: now
						};
					})
				};
			} catch (error) {
				if (error instanceof WorkbenchConflict) return {
					code: "conflict",
					current: error.current
				};
				if (error instanceof WorkbenchEdgeLost) return error.plan.kind === "refuse" ? {
					code: "invalid",
					message: error.plan.message
				} : {
					code: "ok",
					item: error.current
				};
				if (table.get(key) === void 0) return {
					code: "not_found",
					id: request.id
				};
				throw error;
			}
		}
	};
})();
/**
* The canonical instant spelling the domain schema accepts — four-digit year,
* UTC, millisecond precision.
* @returns the current instant.
*/
function nowInstant() {
	return (/* @__PURE__ */ new Date()).toISOString();
}
//#endregion
export { WorkbenchService, WorkbenchService as default };
