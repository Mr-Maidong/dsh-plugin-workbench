import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { WORKBENCH_KIND } from "./definition.js";
import { toMarkdown } from "./store.js";
import css from './WorkbenchMenu.module.css';
/**
 * Read `kind` off a tab record.
 *
 * Probed rather than accessed because `TabRecord` comes from the docking kit,
 * whose types this plugin does not depend on; the field is read defensively so a
 * foreign menu entry can never make this one throw.
 * @param tab - the record from the slot owner props.
 * @returns the tab's kind, or undefined when it has none.
 */
function kindOf(tab) {
    if (typeof tab !== 'object' || tab === null)
        return undefined;
    const value = tab.kind;
    return typeof value === 'string' ? value : undefined;
}
/** Render the workbench entries, or nothing when another tab's menu is open. */
export function WorkbenchMenuItem(props) {
    const { t, reportCopyFailure } = props;
    if (kindOf(props.tab) !== WORKBENCH_KIND)
        return null;
    // Resolved here rather than at click time: this seat's inject face is built per
    // session, so the store exists as soon as the entry is for a workbench tab.
    const store = props.storeFor(props.sessionId);
    return (_jsxs(_Fragment, { children: [_jsx("button", { type: "button", className: css.item, onClick: () => {
                    props.dismiss();
                    void store.refresh();
                }, children: t('action.refresh') }), _jsx("button", { type: "button", className: css.item, onClick: () => {
                    props.dismiss();
                    const markdown = toMarkdown(store.getSnapshot().items);
                    if (markdown === '')
                        return;
                    void navigator.clipboard.writeText(markdown).catch((error) => {
                        reportCopyFailure(error instanceof Error ? error.message : String(error));
                    });
                }, children: t('action.copy') })] }));
}
//# sourceMappingURL=WorkbenchMenu.js.map