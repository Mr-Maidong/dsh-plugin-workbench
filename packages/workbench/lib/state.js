//#region packages/workbench/lib/types/state.js
/**
* Decide which edge a record is on.
* @param status - the status as of the caller's read, or as of its queue slot.
* @returns the plan for that edge.
*/
function planRequestComplete(status) {
	if (status === "done") return {
		kind: "refuse",
		message: "a completed work item cannot be written back again"
	};
	if (status === "in_progress") return { kind: "retry" };
	return { kind: "advance" };
}
//#endregion
export { planRequestComplete };
