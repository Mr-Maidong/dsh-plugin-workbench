import type { ReactNode } from 'react';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { WorkItemRecord } from 'dsh-plugin-workbench/types';
import type { WorkbenchFilterTier, WorkbenchSnapshot, WorkbenchStore } from './store.ts';
import type { WorkspaceListSource } from './workspace-source.ts';
import type { WriteBackQueued } from './write-back.ts';
/** What the slot's inject face supplies to the body. */
export interface WorkbenchInjected {
    /**
     * The snapshot store for one session, created on first use.
     *
     * Per session, not per plugin: the seat is session-scoped, so two sessions can
     * hold this pane at once and each must own its workspace, query, and list.
     * Sharing one store would make them overwrite each other.
     * @param sessionId - the session this pane belongs to.
     * @returns that session's store.
     */
    readonly storeFor: (sessionId: string) => WorkbenchStore;
    /** The Client's Workspace list, so the pane can follow the conversation's workspace. */
    readonly workspaces: WorkspaceListSource;
    /**
     * Queue the user turn that asks the model to write this item's summary back.
     *
     * The second half of the write-back flow (§11.3), and the only place this pane
     * spends a model turn on purpose: the request is an ordinary user message, so
     * it is logged like anything else the user types. It is called only after the
     * Host accepted the request, so the item is already `in_progress` when the
     * model reads it. The result stays structural — the mount owns the session
     * binding and the queue, this pane owns the copy — and a session that is not
     * available is a state the user has to be told about rather than a silent
     * no-op.
     * @param sessionId - the session whose queue receives the prompt.
     * @param item - the item the user asked about.
     * @returns whether the turn was queued, and why not when it was not.
     */
    readonly requestWriteBack: (sessionId: string, item: WorkItemRecord) => Promise<WriteBackQueued>;
    /** @param message - clipboard failure text, logged by the mount. */
    readonly reportCopyFailure: (message: string) => void;
}
export type { WriteBackQueued } from './write-back.ts';
/** Props the slot delivers to the workbench body. */
export type WorkbenchTabProps = PropsRuntime<'sidebar.right.pane.tab'> & InjectFace<WorkbenchInjected> & PropsLocale<'workbench'>;
/**
 * The composer's public action face, as delivered to every session-scope slot.
 *
 * Declared structurally on purpose. `@deepseek-ai/dsh-client-ui-conversation`
 * owns this interface (`client/contract/input.d.ts` → `InputActions`) and merges
 * it into that package's `SessionStandardProps`, so the live Client hands it to
 * this pane as a standard prop — but that package is not a dependency of this
 * plugin, so the property carries no static type here. The names and arities
 * below are copied from its published 0.2.0-rc.2 declaration.
 *
 * Every member is optional. A Client that stops sending the face, or sends a
 * narrower one, then degrades to "no fill button" instead of throwing.
 */
export interface ComposerInputActions {
    /** @returns a revision-guarded copy of the current editor selection. */
    readonly captureInsertion?: () => unknown;
    /**
     * Insert text at a captured selection without replacing later edits.
     * @param text - plain text to insert in one undo step.
     * @param span - a selection captured by `captureInsertion`.
     * @returns false when the draft changed or the editor is locked.
     */
    readonly insertText?: (text: string, span: unknown) => boolean;
    /** Replace the whole draft — the documented programmatic-write path. */
    readonly setDraft?: (text: string) => void;
    /** Return the keyboard to the composer. */
    readonly focus?: () => void;
}
/** Render the workbench pane. */
export declare function WorkbenchTab(props: WorkbenchTabProps): import("react").JSX.Element;
/** Props the title slot delivers; the chip is the plugin's label. */
export type WorkbenchTabTitleProps = InjectFace<WorkbenchInjected> & PropsLocale<'workbench'>;
/**
 * Render the workbench tab's chip title: the workbench mark before the label.
 *
 * §9.47: the mark is full-colour artwork (the layered workbench cards), so it
 * is drawn as an ordinary image rather than through the status marks' alpha
 * mask — a mask would recolour it with the chip's text colour and lose the
 * gradient. The box is sized and aligned in `.titleIcon`.
 */
export declare function WorkbenchTabTitle(props: WorkbenchTabTitleProps): ReactNode;
export type { WorkbenchSnapshot, WorkbenchFilterTier };
//# sourceMappingURL=WorkbenchTab.d.ts.map