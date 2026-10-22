/**
 * Workbench tab, toolbar, list, and detail copy.
 *
 * Every string the pane can show lives here, including the ones only reachable
 * in a later phase: a half-localized pane is worse than a complete dictionary,
 * and `en` is typed against the Chinese key set so the two cannot drift.
 */
/** Namespace owned by the workbench plugin. */
export declare const NS = "workbench";
/** Simplified Chinese labels and dictionary keys. */
export declare const zh: {
    readonly 'tab.title': "工作台";
    readonly 'search.placeholder': "搜索标题、描述、标签…";
    readonly 'filter.all': "全部";
    readonly 'filter.active': "未完成";
    readonly 'filter.done': "已完成";
    readonly 'filter.archived': "已归档";
    readonly 'action.create': "新建工作项";
    readonly 'action.delete': "删除";
    readonly 'action.deleteConfirm': "确定删除工作项「{title}」？此操作不可撤销。";
    readonly 'action.refresh': "刷新";
    readonly 'action.copy': "复制为 Markdown";
    readonly 'action.copied': "已复制到剪贴板";
    readonly 'action.copyFailed': "复制失败：{message}";
    readonly 'state.loading': "正在载入工作项…";
    readonly 'state.error': "载入失败：{message}";
    readonly 'state.retry': "重试";
    readonly 'workspace.none': "没有可用的工作区";
    readonly 'workspace.noneHint': "先在左侧栏创建一个工作区，工作项按工作区存放。";
    readonly 'workspace.unassigned': "这个对话不在任何工作区里";
    readonly 'workspace.unassignedHint': "把对话移进一个工作区，工作台就显示存放在那里的工作项。";
    readonly 'empty.title': "这个工作区还没有工作项";
    readonly 'empty.hint': "用筛选行右侧的「+」新建一条";
    readonly 'empty.filtered': "这一档没有工作项";
    readonly 'empty.filteredHint': "换个筛选档，或把搜索词清空。";
    readonly 'list.more': "还有 {count} 条未显示";
    readonly 'card.noDescription': "添加描述…";
    readonly 'card.noTag': "+ 标签";
    readonly 'card.project': "项目：";
    readonly 'card.status.done': "已完成";
    readonly 'card.status.in_progress': "进行中";
    readonly 'card.statusHint': "状态由写回自动更新";
    readonly 'card.archived': "已归档";
    readonly 'card.justNow': "刚刚";
    readonly 'card.expand': "展开";
    readonly 'card.collapse': "收起";
    readonly 'card.expandDetails': "展开详情";
    readonly 'card.collapseDetails': "收起详情";
    readonly 'card.fillTitle': "把这条工作项填入对话框输入框";
    readonly 'card.fill': "发送";
    readonly 'card.summarize': "总结";
    readonly 'card.archive': "归档";
    readonly 'card.unarchive': "取消归档";
    readonly 'group.active': "未完成";
    readonly 'group.done': "已完成";
    readonly 'group.archived': "已归档";
    readonly 'detail.noCompletion': "还没有待办总结";
    readonly 'writeback.request': "待办总结";
    readonly 'writeback.retry': "待办总结 · 重新写回";
    readonly 'writeback.pending': "已发送，等待模型写回…";
    readonly 'writeback.hintQueued': "写回后本条自动完结";
    readonly 'writeback.hintRunning': "进行中 · 可再次写回";
    readonly 'writeback.failed': "写回请求未能发出：{message}";
    readonly 'writeback.noSession': "当前会话不可用，请重新打开后再试";
    readonly 'completion.title': "待办总结";
    readonly 'completion.implementationPath': "实现路径";
    readonly 'completion.changedFiles': "修改文件";
    readonly 'completion.verification': "验证结果";
    readonly 'completion.by': "{who}写回";
    readonly 'writer.model': "模型";
    readonly 'writer.user': "用户";
    readonly 'verify.passed': "通过";
    readonly 'verify.failed': "失败";
    readonly 'verify.skipped': "跳过";
    readonly 'edit.hint': "回车保存 · Esc 取消";
    readonly 'edit.titlePlaceholder': "标题";
    readonly 'error.conflict': "这条工作项已在别处被修改，本地副本已过期。";
    readonly 'error.notFound': "这条工作项已经不存在了。";
    readonly 'error.invalid': "写入被拒绝：{message}";
};
/** Dictionary keys accepted by this plugin's translator. */
export type WorkbenchLocaleKey = keyof typeof zh;
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Workbench tab and list labels. */
        'workbench': WorkbenchLocaleKey;
    }
}
/** English labels, checked against the Chinese key set. */
export declare const en: Record<WorkbenchLocaleKey, string>;
//# sourceMappingURL=locales.d.ts.map