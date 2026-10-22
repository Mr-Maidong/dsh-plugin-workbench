/**
 * The text a work item contributes to the composer.
 *
 * Kept in its own module because it is the one part of the fill action with a
 * shape worth pinning down, and because `node --test` cannot load the tab module:
 * that one pulls React and the slot package in with it. This module is pure.
 *
 * The handle's 「待办ID」 label is fixed text rather than a locale entry, exactly
 * like the write-back prompt beside it (§11.3): this is not chrome the UI renders,
 * it is the message's own handle — the text lands in the input box, the user edits
 * it, and the model reads the number back to find the record (§9.22).
 */
/**
 * A work item's short number: the first 8 characters of its id.
 *
 * Ids are UUIDs (`crypto.randomUUID()`), which are stable but far too long to sit
 * in a chat message. Eight hex characters are unique in any realistic workbench,
 * and they are what the user reads back to the agent.
 * @param id - the work item's UUID.
 * @returns its short number.
 */
export function shortNumber(id) {
    return id.slice(0, 8);
}
/**
 * The text one work item contributes to the composer.
 *
 * Title first, carrying the item's short number in a labelled handle —
 * `标题（待办ID：#7f3a9c2e）` — because the message has to say which record it came
 * from and a bare number reads as prose (§9.22); then the description under it,
 * and nothing else: the composer stays the user's to finish, so this adds no
 * instruction of its own.
 * @param item - the work item being handed over.
 * @returns the seed text, or an empty string for an item with neither field.
 */
export function seedText(item) {
    const title = item.title.trim();
    const desc = item.desc.trim();
    // The handle rides with the title: a titleless item has nothing for it to sit
    // behind, so the description stands alone there.
    const head = title === '' ? '' : `${title}（待办ID：#${shortNumber(item.id)}）`;
    if (desc === '')
        return head;
    return head === '' ? desc : `${head}\n${desc}`;
}
//# sourceMappingURL=seed.js.map