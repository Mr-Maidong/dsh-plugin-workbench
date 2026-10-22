/**
 * Workbench tab, toolbar, list, and detail copy.
 *
 * Every string the pane can show lives here, including the ones only reachable
 * in a later phase: a half-localized pane is worse than a complete dictionary,
 * and `en` is typed against the Chinese key set so the two cannot drift.
 */
/** Namespace owned by the workbench plugin. */
export const NS = 'workbench';
/** Simplified Chinese labels and dictionary keys. */
export const zh = {
    'tab.title': '工作台',
    'search.placeholder': '搜索标题、描述、标签…',
    // Four filter tiers (§5.4). `archived` is orthogonal to status, not a status.
    'filter.all': '全部',
    'filter.active': '未完成',
    'filter.done': '已完成',
    'filter.archived': '已归档',
    'action.create': '新建工作项',
    'action.delete': '删除',
    'action.deleteConfirm': '确定删除工作项「{title}」？此操作不可撤销。',
    'action.refresh': '刷新',
    'action.copy': '复制为 Markdown',
    'action.copied': '已复制到剪贴板',
    'action.copyFailed': '复制失败：{message}',
    'state.loading': '正在载入工作项…',
    'state.error': '载入失败：{message}',
    'state.retry': '重试',
    'workspace.none': '没有可用的工作区',
    'workspace.noneHint': '先在左侧栏创建一个工作区，工作项按工作区存放。',
    'workspace.unassigned': '这个对话不在任何工作区里',
    'workspace.unassignedHint': '把对话移进一个工作区，工作台就显示存放在那里的工作项。',
    'empty.title': '这个工作区还没有工作项',
    'empty.hint': '用筛选行右侧的「+」新建一条',
    'empty.filtered': '这一档没有工作项',
    'empty.filteredHint': '换个筛选档，或把搜索词清空。',
    'list.more': '还有 {count} 条未显示',
    'card.noDescription': '添加描述…',
    'card.noTag': '+ 标签',
    'card.status.done': '已完成',
    'card.status.in_progress': '进行中',
    'card.statusHint': '状态由写回自动更新',
    'card.archived': '已归档',
    'card.justNow': '刚刚',
    'card.expand': '展开',
    'card.collapse': '收起',
    'card.fillTitle': '把这条工作项填入对话框输入框',
    'group.active': '未完成',
    'group.done': '已完成',
    'group.archived': '已归档',
    'detail.noCompletion': '还没有待办总结',
    // The write-back control in the card's heading line (§4.5, §9.13). Its label is
    // the same words as the section it produces, because the two now name one thing:
    // the request is "give this item a to-do summary", and the section holds it. The
    // retry copy is the prototype's, since "again" is the whole point of that edge.
    // `writeback.done` is gone: a finished item draws no control at all (§9.13), and
    // `card.statusHint` already explains why the status moves on its own.
    'writeback.request': '待办总结',
    'writeback.retry': '待办总结 · 重新写回',
    // §9.19: the click is now the first half of a two-part flow, so the control has
    // a state its label cannot carry on its own — sent, waiting for the model — and
    // the expanded area explains what each status will do. The failure text is the
    // one place the reason a request never reached the model is reported.
    'writeback.pending': '已发送，等待模型写回…',
    'writeback.hintQueued': '写回后本条自动完结',
    'writeback.hintRunning': '进行中 · 可再次写回',
    'writeback.failed': '写回请求未能发出：{message}',
    'writeback.noSession': '当前会话不可用，请重新打开后再试',
    // The divider's own label (§9.10). It used to be one word shared by both locales;
    // it is the control's word now, so each locale spells it out.
    'completion.title': '待办总结',
    'completion.implementationPath': '实现路径',
    'completion.changedFiles': '修改文件',
    'completion.verification': '验证结果',
    'completion.by': '{who}写回',
    'writer.model': '模型',
    'writer.user': '用户',
    'verify.passed': '通过',
    'verify.failed': '失败',
    'verify.skipped': '跳过',
    'edit.hint': '回车保存 · Esc 取消',
    // Only the new-item composer needs a title placeholder — an existing item always
    // has a title. The description and the tag take the display state's own empty
    // words (`card.noDescription` / `card.noTag`) instead, so their text does not
    // change when they are clicked (§9.14).
    'edit.titlePlaceholder': '标题',
    'error.conflict': '这条工作项已在别处被修改，本地副本已过期。',
    'error.notFound': '这条工作项已经不存在了。',
    'error.invalid': '写入被拒绝：{message}',
};
/** English labels, checked against the Chinese key set. */
export const en = {
    'tab.title': 'Workbench',
    'search.placeholder': 'Search title, description, tag…',
    'filter.all': 'All',
    'filter.active': 'Open',
    'filter.done': 'Done',
    'filter.archived': 'Archived',
    'action.create': 'New work item',
    'action.delete': 'Delete',
    'action.deleteConfirm': 'Delete the work item “{title}”? This cannot be undone.',
    'action.refresh': 'Refresh',
    'action.copy': 'Copy as Markdown',
    'action.copied': 'Copied to clipboard',
    'action.copyFailed': 'Copy failed: {message}',
    'state.loading': 'Loading work items…',
    'state.error': 'Could not load: {message}',
    'state.retry': 'Retry',
    'workspace.none': 'No workspace available',
    'workspace.noneHint': 'Create a workspace in the left sidebar first; work items are stored per workspace.',
    'workspace.unassigned': 'This conversation is not in a workspace',
    'workspace.unassignedHint': 'Move the conversation into a workspace and the workbench shows the work items kept there.',
    'empty.title': 'No work items in this workspace',
    'empty.hint': 'Create one with the “+” at the right of the filter row',
    'empty.filtered': 'Nothing in this tier',
    'empty.filteredHint': 'Try another tier, or clear the search box.',
    'list.more': '{count} more not shown',
    'card.noDescription': 'Add a description…',
    'card.noTag': '+ tag',
    'card.status.done': 'Done',
    'card.status.in_progress': 'In progress',
    'card.statusHint': 'Status is updated by write-back',
    'card.archived': 'Archived',
    'card.justNow': 'just now',
    'card.expand': 'Expand',
    'card.collapse': 'Collapse',
    'card.fillTitle': 'Put this work item into the composer input',
    'group.active': 'Open',
    'group.done': 'Done',
    'group.archived': 'Archived',
    'detail.noCompletion': 'No to-do summary yet',
    // The write-back control in the card's heading line (§4.5, §9.13).
    'writeback.request': 'To-do summary',
    'writeback.retry': 'To-do summary · write back again',
    'writeback.pending': 'Sent, waiting for the model…',
    'writeback.hintQueued': 'The write-back completes this item',
    'writeback.hintRunning': 'In progress · can be written back again',
    'writeback.failed': 'The write-back request could not be sent: {message}',
    'writeback.noSession': 'This session is not available; reopen it and try again',
    // The divider's own label (§9.10).
    'completion.title': 'To-do summary',
    'completion.implementationPath': 'Implementation path',
    'completion.changedFiles': 'Changed files',
    'completion.verification': 'Verification',
    'completion.by': 'Written back by {who}',
    'writer.model': 'the model',
    'writer.user': 'the user',
    'verify.passed': 'passed',
    'verify.failed': 'failed',
    'verify.skipped': 'skipped',
    'edit.hint': 'Enter to save · Esc to cancel',
    // Only the composer needs a title placeholder (§9.14): the other two fields
    // reuse the display state's empty words.
    'edit.titlePlaceholder': 'Title',
    'error.conflict': 'This work item changed elsewhere; the local copy is stale.',
    'error.notFound': 'That work item no longer exists.',
    'error.invalid': 'Write rejected: {message}',
};
//# sourceMappingURL=locales.js.map