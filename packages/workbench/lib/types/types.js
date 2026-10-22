/**
 * Work-item record and the Remote contract the browser half reads.
 *
 * Everything here is JSON-safe by construction: the values cross a Typert
 * Remote boundary and are re-validated by zod on the way back out of storage
 * (see `storage.ts`), so a value that cannot survive that round trip must not
 * be spelled here.
 *
 * @module dsh-plugin-workbench/types
 */
export {};
//# sourceMappingURL=types.js.map