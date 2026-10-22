import type { InvocationDescriptor } from '@deepseek-ai/dsh-typert-protocol';
/** npm package name; also the Remote contribution's owning identity. */
export declare const PACKAGE_NAME = "dsh-plugin-workbench";
/** Cordis service key, and the wire namespace the client calls it under. */
export declare const SERVICE_KEY = "workbench";
/**
 * Every Remote method this package publishes, in one list.
 *
 * `sourceLocation` is deliberately omitted: the protocol types it as optional
 * and diagnostic-only, and a hand-maintained line number would drift the moment
 * `index.ts` is edited — pointing diagnostics at the wrong method is worse than
 * having none.
 */
export declare const INVOCATIONS: readonly InvocationDescriptor[];
//# sourceMappingURL=typert.contract.d.ts.map