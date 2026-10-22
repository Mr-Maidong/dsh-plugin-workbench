import workbenchRemote from 'dsh-plugin-workbench/remote';
import { mountWorkbench } from "./mount.js";
export { inject } from "./mount.js";
export { WORKBENCH_KIND, WORKBENCH_TAB_ID, workbenchTabDefinition, } from "./definition.js";
export { guardWorkbenchTab, ruleWorkbenchTab } from "./guard.js";
export { en, NS, zh } from "./locales.js";
/**
 * Mount the Remote face, then the workbench tab, as one plugin lifecycle.
 * @param ctx - Client runtime owning the Remote, dictionaries, and slots.
 * @returns disposer joined over the Remote withdrawal and the UI teardown.
 */
export async function apply(ctx) {
    return await mountWorkbench(ctx, workbenchRemote);
}
//# sourceMappingURL=index.js.map