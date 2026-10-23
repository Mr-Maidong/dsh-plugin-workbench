window.__ModuleLoader__.load({
	id: "dsh-plugin-workbench",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/core.js
		var _a$1;
		function $constructor(name, initializer, params) {
			function init(inst, def) {
				if (!inst._zod) Object.defineProperty(inst, "_zod", {
					value: {
						def,
						constr: _,
						traits: /* @__PURE__ */ new Set()
					},
					enumerable: false
				});
				if (inst._zod.traits.has(name)) return;
				inst._zod.traits.add(name);
				initializer(inst, def);
				const proto = _.prototype;
				const keys = Object.keys(proto);
				for (let i = 0; i < keys.length; i++) {
					const k = keys[i];
					if (!(k in inst)) inst[k] = proto[k].bind(inst);
				}
			}
			const Parent = params?.Parent ?? Object;
			class Definition extends Parent {}
			Object.defineProperty(Definition, "name", { value: name });
			function _(def) {
				var _a;
				const inst = params?.Parent ? new Definition() : this;
				init(inst, def);
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				for (const fn of inst._zod.deferred) fn();
				return inst;
			}
			Object.defineProperty(_, "init", { value: init });
			Object.defineProperty(_, Symbol.hasInstance, { value: (inst) => {
				if (params?.Parent && inst instanceof params.Parent) return true;
				return inst?._zod?.traits?.has(name);
			} });
			Object.defineProperty(_, "name", { value: name });
			return _;
		}
		var $ZodAsyncError = class extends Error {
			constructor() {
				super(`Encountered Promise during synchronous parse. Use .parseAsync() instead.`);
			}
		};
		var $ZodEncodeError = class extends Error {
			constructor(name) {
				super(`Encountered unidirectional transform during encode: ${name}`);
				this.name = "ZodEncodeError";
			}
		};
		(_a$1 = globalThis).__zod_globalConfig ?? (_a$1.__zod_globalConfig = {});
		const globalConfig = globalThis.__zod_globalConfig;
		function config(newConfig) {
			if (newConfig) Object.assign(globalConfig, newConfig);
			return globalConfig;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/util.js
		function getEnumValues(entries) {
			const numericValues = Object.values(entries).filter((v) => typeof v === "number");
			return Object.entries(entries).filter(([k, _]) => numericValues.indexOf(+k) === -1).map(([_, v]) => v);
		}
		function jsonStringifyReplacer(_, value) {
			if (typeof value === "bigint") return value.toString();
			return value;
		}
		function cached(getter) {
			return { get value() {
				{
					const value = getter();
					Object.defineProperty(this, "value", { value });
					return value;
				}
			} };
		}
		function nullish(input) {
			return input === null || input === void 0;
		}
		function cleanRegex(source) {
			const start = source.startsWith("^") ? 1 : 0;
			const end = source.endsWith("$") ? source.length - 1 : source.length;
			return source.slice(start, end);
		}
		function floatSafeRemainder(val, step) {
			const ratio = val / step;
			const roundedRatio = Math.round(ratio);
			const tolerance = Number.EPSILON * Math.max(Math.abs(ratio), 1);
			if (Math.abs(ratio - roundedRatio) < tolerance) return 0;
			return ratio - roundedRatio;
		}
		const EVALUATING = /* @__PURE__*/ Symbol("evaluating");
		function defineLazy(object, key, getter) {
			let value = void 0;
			Object.defineProperty(object, key, {
				get() {
					if (value === EVALUATING) return;
					if (value === void 0) {
						value = EVALUATING;
						value = getter();
					}
					return value;
				},
				set(v) {
					Object.defineProperty(object, key, { value: v });
				},
				configurable: true
			});
		}
		function assignProp(target, prop, value) {
			Object.defineProperty(target, prop, {
				value,
				writable: true,
				enumerable: true,
				configurable: true
			});
		}
		function mergeDefs(...defs) {
			const mergedDescriptors = {};
			for (const def of defs) {
				const descriptors = Object.getOwnPropertyDescriptors(def);
				Object.assign(mergedDescriptors, descriptors);
			}
			return Object.defineProperties({}, mergedDescriptors);
		}
		function esc(str) {
			return JSON.stringify(str);
		}
		function slugify(input) {
			return input.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
		}
		const captureStackTrace = "captureStackTrace" in Error ? Error.captureStackTrace : (..._args) => {};
		function isObject(data) {
			return typeof data === "object" && data !== null && !Array.isArray(data);
		}
		const allowsEval = /* @__PURE__*/ cached(() => {
			if (globalConfig.jitless) return false;
			if (typeof navigator !== "undefined" && navigator?.userAgent?.includes("Cloudflare")) return false;
			try {
				new Function("");
				return true;
			} catch (_) {
				return false;
			}
		});
		function isPlainObject(o) {
			if (isObject(o) === false) return false;
			const ctor = o.constructor;
			if (ctor === void 0) return true;
			if (typeof ctor !== "function") return true;
			const prot = ctor.prototype;
			if (isObject(prot) === false) return false;
			if (Object.prototype.hasOwnProperty.call(prot, "isPrototypeOf") === false) return false;
			return true;
		}
		function shallowClone(o) {
			if (isPlainObject(o)) return { ...o };
			if (Array.isArray(o)) return [...o];
			if (o instanceof Map) return new Map(o);
			if (o instanceof Set) return new Set(o);
			return o;
		}
		const propertyKeyTypes = /* @__PURE__*/ new Set([
			"string",
			"number",
			"symbol"
		]);
		function escapeRegex(str) {
			return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		}
		function clone(inst, def, params) {
			const cl = new inst._zod.constr(def ?? inst._zod.def);
			if (!def || params?.parent) cl._zod.parent = inst;
			return cl;
		}
		function normalizeParams(_params) {
			const params = _params;
			if (!params) return {};
			if (typeof params === "string") return { error: () => params };
			if (params?.message !== void 0) {
				if (params?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params");
				params.error = params.message;
			}
			delete params.message;
			if (typeof params.error === "string") return {
				...params,
				error: () => params.error
			};
			return params;
		}
		function optionalKeys(shape) {
			return Object.keys(shape).filter((k) => {
				return shape[k]._zod.optin === "optional" && shape[k]._zod.optout === "optional";
			});
		}
		const NUMBER_FORMAT_RANGES = {
			safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
			int32: [-2147483648, 2147483647],
			uint32: [0, 4294967295],
			float32: [-34028234663852886e22, 34028234663852886e22],
			float64: [-Number.MAX_VALUE, Number.MAX_VALUE]
		};
		function pick(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".pick() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = {};
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						newShape[key] = currDef.shape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function omit(schema, mask) {
			const currDef = schema._zod.def;
			const checks = currDef.checks;
			if (checks && checks.length > 0) throw new Error(".omit() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const newShape = { ...schema._zod.def.shape };
					for (const key in mask) {
						if (!(key in currDef.shape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						delete newShape[key];
					}
					assignProp(this, "shape", newShape);
					return newShape;
				},
				checks: []
			}));
		}
		function extend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to extend: expected a plain object");
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) {
				const existingShape = schema._zod.def.shape;
				for (const key in shape) if (Object.getOwnPropertyDescriptor(existingShape, key) !== void 0) throw new Error("Cannot overwrite keys on object schemas containing refinements. Use `.safeExtend()` instead.");
			}
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function safeExtend(schema, shape) {
			if (!isPlainObject(shape)) throw new Error("Invalid input to safeExtend: expected a plain object");
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const _shape = {
					...schema._zod.def.shape,
					...shape
				};
				assignProp(this, "shape", _shape);
				return _shape;
			} }));
		}
		function merge(a, b) {
			if (a._zod.def.checks?.length) throw new Error(".merge() cannot be used on object schemas containing refinements. Use .safeExtend() instead.");
			return clone(a, mergeDefs(a._zod.def, {
				get shape() {
					const _shape = {
						...a._zod.def.shape,
						...b._zod.def.shape
					};
					assignProp(this, "shape", _shape);
					return _shape;
				},
				get catchall() {
					return b._zod.def.catchall;
				},
				checks: b._zod.def.checks ?? []
			}));
		}
		function partial(Class, schema, mask) {
			const checks = schema._zod.def.checks;
			if (checks && checks.length > 0) throw new Error(".partial() cannot be used on object schemas containing refinements");
			return clone(schema, mergeDefs(schema._zod.def, {
				get shape() {
					const oldShape = schema._zod.def.shape;
					const shape = { ...oldShape };
					if (mask) for (const key in mask) {
						if (!(key in oldShape)) throw new Error(`Unrecognized key: "${key}"`);
						if (!mask[key]) continue;
						shape[key] = Class ? new Class({
							type: "optional",
							innerType: oldShape[key]
						}) : oldShape[key];
					}
					else for (const key in oldShape) shape[key] = Class ? new Class({
						type: "optional",
						innerType: oldShape[key]
					}) : oldShape[key];
					assignProp(this, "shape", shape);
					return shape;
				},
				checks: []
			}));
		}
		function required(Class, schema, mask) {
			return clone(schema, mergeDefs(schema._zod.def, { get shape() {
				const oldShape = schema._zod.def.shape;
				const shape = { ...oldShape };
				if (mask) for (const key in mask) {
					if (!(key in shape)) throw new Error(`Unrecognized key: "${key}"`);
					if (!mask[key]) continue;
					shape[key] = new Class({
						type: "nonoptional",
						innerType: oldShape[key]
					});
				}
				else for (const key in oldShape) shape[key] = new Class({
					type: "nonoptional",
					innerType: oldShape[key]
				});
				assignProp(this, "shape", shape);
				return shape;
			} }));
		}
		function aborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue !== true) return true;
			return false;
		}
		function explicitlyAborted(x, startIndex = 0) {
			if (x.aborted === true) return true;
			for (let i = startIndex; i < x.issues.length; i++) if (x.issues[i]?.continue === false) return true;
			return false;
		}
		function prefixIssues(path, issues) {
			return issues.map((iss) => {
				var _a;
				(_a = iss).path ?? (_a.path = []);
				iss.path.unshift(path);
				return iss;
			});
		}
		function unwrapMessage(message) {
			return typeof message === "string" ? message : message?.message;
		}
		function finalizeIssue(iss, ctx, config) {
			const message = iss.message ? iss.message : unwrapMessage(iss.inst?._zod.def?.error?.(iss)) ?? unwrapMessage(ctx?.error?.(iss)) ?? unwrapMessage(config.customError?.(iss)) ?? unwrapMessage(config.localeError?.(iss)) ?? "Invalid input";
			const { inst: _inst, continue: _continue, input: _input, ...rest } = iss;
			rest.path ?? (rest.path = []);
			rest.message = message;
			if (ctx?.reportInput) rest.input = _input;
			return rest;
		}
		function getLengthableOrigin(input) {
			if (Array.isArray(input)) return "array";
			if (typeof input === "string") return "string";
			return "unknown";
		}
		function issue(...args) {
			const [iss, input, inst] = args;
			if (typeof iss === "string") return {
				message: iss,
				code: "custom",
				input,
				inst
			};
			return { ...iss };
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/errors.js
		const initializer$1 = (inst, def) => {
			inst.name = "$ZodError";
			Object.defineProperty(inst, "_zod", {
				value: inst._zod,
				enumerable: false
			});
			Object.defineProperty(inst, "issues", {
				value: def,
				enumerable: false
			});
			inst.message = JSON.stringify(def, jsonStringifyReplacer, 2);
			Object.defineProperty(inst, "toString", {
				value: () => inst.message,
				enumerable: false
			});
		};
		const $ZodError = $constructor("$ZodError", initializer$1);
		const $ZodRealError = $constructor("$ZodError", initializer$1, { Parent: Error });
		function flattenError(error, mapper = (issue) => issue.message) {
			const fieldErrors = {};
			const formErrors = [];
			for (const sub of error.issues) if (sub.path.length > 0) {
				fieldErrors[sub.path[0]] = fieldErrors[sub.path[0]] || [];
				fieldErrors[sub.path[0]].push(mapper(sub));
			} else formErrors.push(mapper(sub));
			return {
				formErrors,
				fieldErrors
			};
		}
		function formatError(error, mapper = (issue) => issue.message) {
			const fieldErrors = { _errors: [] };
			const processError = (error, path = []) => {
				for (const issue of error.issues) if (issue.code === "invalid_union" && issue.errors.length) issue.errors.map((issues) => processError({ issues }, [...path, ...issue.path]));
				else if (issue.code === "invalid_key") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else if (issue.code === "invalid_element") processError({ issues: issue.issues }, [...path, ...issue.path]);
				else {
					const fullpath = [...path, ...issue.path];
					if (fullpath.length === 0) fieldErrors._errors.push(mapper(issue));
					else {
						let curr = fieldErrors;
						let i = 0;
						while (i < fullpath.length) {
							const el = fullpath[i];
							if (!(i === fullpath.length - 1)) curr[el] = curr[el] || { _errors: [] };
							else {
								curr[el] = curr[el] || { _errors: [] };
								curr[el]._errors.push(mapper(issue));
							}
							curr = curr[el];
							i++;
						}
					}
				}
			};
			processError(error);
			return fieldErrors;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/parse.js
		const _parse = (_Err) => (schema, value, _ctx, _params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			if (result.issues.length) {
				const e = new ((_params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, _params?.callee);
				throw e;
			}
			return result.value;
		};
		const _parseAsync = (_Err) => async (schema, value, _ctx, params) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			if (result.issues.length) {
				const e = new ((params?.Err) ?? _Err)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())));
				captureStackTrace(e, params?.callee);
				throw e;
			}
			return result.value;
		};
		const _safeParse = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: false
			} : { async: false };
			const result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) throw new $ZodAsyncError();
			return result.issues.length ? {
				success: false,
				error: new (_Err ?? $ZodError)(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParse$1 = /* @__PURE__*/ _safeParse($ZodRealError);
		const _safeParseAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				async: true
			} : { async: true };
			let result = schema._zod.run({
				value,
				issues: []
			}, ctx);
			if (result instanceof Promise) result = await result;
			return result.issues.length ? {
				success: false,
				error: new _Err(result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			} : {
				success: true,
				data: result.value
			};
		};
		const safeParseAsync$1 = /* @__PURE__*/ _safeParseAsync($ZodRealError);
		const _encode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parse(_Err)(schema, value, ctx);
		};
		const _decode = (_Err) => (schema, value, _ctx) => {
			return _parse(_Err)(schema, value, _ctx);
		};
		const _encodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _parseAsync(_Err)(schema, value, ctx);
		};
		const _decodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _parseAsync(_Err)(schema, value, _ctx);
		};
		const _safeEncode = (_Err) => (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParse(_Err)(schema, value, ctx);
		};
		const _safeDecode = (_Err) => (schema, value, _ctx) => {
			return _safeParse(_Err)(schema, value, _ctx);
		};
		const _safeEncodeAsync = (_Err) => async (schema, value, _ctx) => {
			const ctx = _ctx ? {
				..._ctx,
				direction: "backward"
			} : { direction: "backward" };
			return _safeParseAsync(_Err)(schema, value, ctx);
		};
		const _safeDecodeAsync = (_Err) => async (schema, value, _ctx) => {
			return _safeParseAsync(_Err)(schema, value, _ctx);
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/regexes.js
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const cuid = /^[cC][0-9a-z]{6,}$/;
		const cuid2 = /^[0-9a-z]+$/;
		const ulid = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/;
		const xid = /^[0-9a-vA-V]{20}$/;
		const ksuid = /^[A-Za-z0-9]{27}$/;
		const nanoid = /^[a-zA-Z0-9_-]{21}$/;
		/** ISO 8601-1 duration regex. Does not support the 8601-2 extensions like negative durations or fractional/negative components. */
		const duration$1 = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/;
		/** A regex for any UUID-like identifier: 8-4-4-4-12 hex pattern */
		const guid = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;
		/** Returns a regex for validating an RFC 9562/4122 UUID.
		*
		* @param version Optionally specify a version 1-8. If no version is specified, all versions are supported. */
		const uuid = (version) => {
			if (!version) return /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/;
			return new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${version}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`);
		};
		/** Practical email validation */
		const email = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/;
		const _emoji$1 = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
		function emoji() {
			return new RegExp(_emoji$1, "u");
		}
		const ipv4 = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
		const ipv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:))$/;
		const cidrv4 = /^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/;
		const cidrv6 = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
		const base64 = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/;
		const base64url = /^[A-Za-z0-9_-]*$/;
		const httpProtocol = /^https?$/;
		const e164 = /^\+[1-9]\d{6,14}$/;
		const dateSource = `(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))`;
		const date$1 = /*@__PURE__*/ new RegExp(`^${dateSource}$`);
		function timeSource(args) {
			const hhmm = `(?:[01]\\d|2[0-3]):[0-5]\\d`;
			return typeof args.precision === "number" ? args.precision === -1 ? `${hhmm}` : args.precision === 0 ? `${hhmm}:[0-5]\\d` : `${hhmm}:[0-5]\\d\\.\\d{${args.precision}}` : `${hhmm}(?::[0-5]\\d(?:\\.\\d+)?)?`;
		}
		function time$1(args) {
			return new RegExp(`^${timeSource(args)}$`);
		}
		function datetime$1(args) {
			const time = timeSource({ precision: args.precision });
			const opts = ["Z"];
			if (args.local) opts.push("");
			if (args.offset) opts.push(`([+-](?:[01]\\d|2[0-3]):[0-5]\\d)`);
			const timeRegex = `${time}(?:${opts.join("|")})`;
			return new RegExp(`^${dateSource}T(?:${timeRegex})$`);
		}
		const string$1 = (params) => {
			const regex = params ? `[\\s\\S]{${params?.minimum ?? 0},${params?.maximum ?? ""}}` : `[\\s\\S]*`;
			return new RegExp(`^${regex}$`);
		};
		const integer = /^-?\d+$/;
		const number$1 = /^-?\d+(?:\.\d+)?$/;
		const boolean$1 = /^(?:true|false)$/i;
		const lowercase = /^[^A-Z]*$/;
		const uppercase = /^[^a-z]*$/;
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/checks.js
		const $ZodCheck = /*@__PURE__*/ $constructor("$ZodCheck", (inst, def) => {
			var _a;
			inst._zod ?? (inst._zod = {});
			inst._zod.def = def;
			(_a = inst._zod).onattach ?? (_a.onattach = []);
		});
		const numericOriginMap = {
			number: "number",
			bigint: "bigint",
			object: "date"
		};
		const $ZodCheckLessThan = /*@__PURE__*/ $constructor("$ZodCheckLessThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.maximum : bag.exclusiveMaximum) ?? Number.POSITIVE_INFINITY;
				if (def.value < curr) {
					if (def.inclusive) bag.maximum = def.value;
					else bag.exclusiveMaximum = def.value;
				}
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value <= def.value : payload.value < def.value) return;
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckGreaterThan = /*@__PURE__*/ $constructor("$ZodCheckGreaterThan", (inst, def) => {
			$ZodCheck.init(inst, def);
			const origin = numericOriginMap[typeof def.value];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				const curr = (def.inclusive ? bag.minimum : bag.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY;
				if (def.value > curr) {
					if (def.inclusive) bag.minimum = def.value;
					else bag.exclusiveMinimum = def.value;
				}
			});
			inst._zod.check = (payload) => {
				if (def.inclusive ? payload.value >= def.value : payload.value > def.value) return;
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: typeof def.value === "object" ? def.value.getTime() : def.value,
					input: payload.value,
					inclusive: def.inclusive,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMultipleOf = /*@__PURE__*/ $constructor("$ZodCheckMultipleOf", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				var _a;
				(_a = inst._zod.bag).multipleOf ?? (_a.multipleOf = def.value);
			});
			inst._zod.check = (payload) => {
				if (typeof payload.value !== typeof def.value) throw new Error("Cannot mix number and bigint in multiple_of check.");
				if (typeof payload.value === "bigint" ? payload.value % def.value === BigInt(0) : floatSafeRemainder(payload.value, def.value) === 0) return;
				payload.issues.push({
					origin: typeof payload.value,
					code: "not_multiple_of",
					divisor: def.value,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckNumberFormat = /*@__PURE__*/ $constructor("$ZodCheckNumberFormat", (inst, def) => {
			$ZodCheck.init(inst, def);
			def.format = def.format || "float64";
			const isInt = def.format?.includes("int");
			const origin = isInt ? "int" : "number";
			const [minimum, maximum] = NUMBER_FORMAT_RANGES[def.format];
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				bag.minimum = minimum;
				bag.maximum = maximum;
				if (isInt) bag.pattern = integer;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (isInt) {
					if (!Number.isInteger(input)) {
						payload.issues.push({
							expected: origin,
							format: def.format,
							code: "invalid_type",
							continue: false,
							input,
							inst
						});
						return;
					}
					if (!Number.isSafeInteger(input)) {
						if (input > 0) payload.issues.push({
							input,
							code: "too_big",
							maximum: Number.MAX_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						else payload.issues.push({
							input,
							code: "too_small",
							minimum: Number.MIN_SAFE_INTEGER,
							note: "Integers must be within the safe integer range.",
							inst,
							origin,
							inclusive: true,
							continue: !def.abort
						});
						return;
					}
				}
				if (input < minimum) payload.issues.push({
					origin: "number",
					input,
					code: "too_small",
					minimum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
				if (input > maximum) payload.issues.push({
					origin: "number",
					input,
					code: "too_big",
					maximum,
					inclusive: true,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMaxLength = /*@__PURE__*/ $constructor("$ZodCheckMaxLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.maximum ?? Number.POSITIVE_INFINITY;
				if (def.maximum < curr) inst._zod.bag.maximum = def.maximum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length <= def.maximum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_big",
					maximum: def.maximum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckMinLength = /*@__PURE__*/ $constructor("$ZodCheckMinLength", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const curr = inst._zod.bag.minimum ?? Number.NEGATIVE_INFINITY;
				if (def.minimum > curr) inst._zod.bag.minimum = def.minimum;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				if (input.length >= def.minimum) return;
				const origin = getLengthableOrigin(input);
				payload.issues.push({
					origin,
					code: "too_small",
					minimum: def.minimum,
					inclusive: true,
					input,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLengthEquals = /*@__PURE__*/ $constructor("$ZodCheckLengthEquals", (inst, def) => {
			var _a;
			$ZodCheck.init(inst, def);
			(_a = inst._zod.def).when ?? (_a.when = (payload) => {
				const val = payload.value;
				return !nullish(val) && val.length !== void 0;
			});
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.minimum = def.length;
				bag.maximum = def.length;
				bag.length = def.length;
			});
			inst._zod.check = (payload) => {
				const input = payload.value;
				const length = input.length;
				if (length === def.length) return;
				const origin = getLengthableOrigin(input);
				const tooBig = length > def.length;
				payload.issues.push({
					origin,
					...tooBig ? {
						code: "too_big",
						maximum: def.length
					} : {
						code: "too_small",
						minimum: def.length
					},
					inclusive: true,
					exact: true,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStringFormat = /*@__PURE__*/ $constructor("$ZodCheckStringFormat", (inst, def) => {
			var _a, _b;
			$ZodCheck.init(inst, def);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.format = def.format;
				if (def.pattern) {
					bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
					bag.patterns.add(def.pattern);
				}
			});
			if (def.pattern) (_a = inst._zod).check ?? (_a.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: def.format,
					input: payload.value,
					...def.pattern ? { pattern: def.pattern.toString() } : {},
					inst,
					continue: !def.abort
				});
			});
			else (_b = inst._zod).check ?? (_b.check = () => {});
		});
		const $ZodCheckRegex = /*@__PURE__*/ $constructor("$ZodCheckRegex", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				def.pattern.lastIndex = 0;
				if (def.pattern.test(payload.value)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "regex",
					input: payload.value,
					pattern: def.pattern.toString(),
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckLowerCase = /*@__PURE__*/ $constructor("$ZodCheckLowerCase", (inst, def) => {
			def.pattern ?? (def.pattern = lowercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckUpperCase = /*@__PURE__*/ $constructor("$ZodCheckUpperCase", (inst, def) => {
			def.pattern ?? (def.pattern = uppercase);
			$ZodCheckStringFormat.init(inst, def);
		});
		const $ZodCheckIncludes = /*@__PURE__*/ $constructor("$ZodCheckIncludes", (inst, def) => {
			$ZodCheck.init(inst, def);
			const escapedRegex = escapeRegex(def.includes);
			const pattern = new RegExp(typeof def.position === "number" ? `^.{${def.position}}${escapedRegex}` : escapedRegex);
			def.pattern = pattern;
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.includes(def.includes, def.position)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "includes",
					includes: def.includes,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckStartsWith = /*@__PURE__*/ $constructor("$ZodCheckStartsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`^${escapeRegex(def.prefix)}.*`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.startsWith(def.prefix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "starts_with",
					prefix: def.prefix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckEndsWith = /*@__PURE__*/ $constructor("$ZodCheckEndsWith", (inst, def) => {
			$ZodCheck.init(inst, def);
			const pattern = new RegExp(`.*${escapeRegex(def.suffix)}$`);
			def.pattern ?? (def.pattern = pattern);
			inst._zod.onattach.push((inst) => {
				const bag = inst._zod.bag;
				bag.patterns ?? (bag.patterns = /* @__PURE__ */ new Set());
				bag.patterns.add(pattern);
			});
			inst._zod.check = (payload) => {
				if (payload.value.endsWith(def.suffix)) return;
				payload.issues.push({
					origin: "string",
					code: "invalid_format",
					format: "ends_with",
					suffix: def.suffix,
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodCheckOverwrite = /*@__PURE__*/ $constructor("$ZodCheckOverwrite", (inst, def) => {
			$ZodCheck.init(inst, def);
			inst._zod.check = (payload) => {
				payload.value = def.tx(payload.value);
			};
		});
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/doc.js
		var Doc = class {
			constructor(args = []) {
				this.content = [];
				this.indent = 0;
				if (this) this.args = args;
			}
			indented(fn) {
				this.indent += 1;
				fn(this);
				this.indent -= 1;
			}
			write(arg) {
				if (typeof arg === "function") {
					arg(this, { execution: "sync" });
					arg(this, { execution: "async" });
					return;
				}
				const lines = arg.split("\n").filter((x) => x);
				const minIndent = Math.min(...lines.map((x) => x.length - x.trimStart().length));
				const dedented = lines.map((x) => x.slice(minIndent)).map((x) => " ".repeat(this.indent * 2) + x);
				for (const line of dedented) this.content.push(line);
			}
			compile() {
				const F = Function;
				const args = this?.args;
				const lines = [...(this?.content ?? [``]).map((x) => `  ${x}`)];
				return new F(...args, lines.join("\n"));
			}
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/versions.js
		const version = {
			major: 4,
			minor: 4,
			patch: 3
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/schemas.js
		const $ZodType = /*@__PURE__*/ $constructor("$ZodType", (inst, def) => {
			var _a;
			inst ?? (inst = {});
			inst._zod.def = def;
			inst._zod.bag = inst._zod.bag || {};
			inst._zod.version = version;
			const checks = [...inst._zod.def.checks ?? []];
			if (inst._zod.traits.has("$ZodCheck")) checks.unshift(inst);
			for (const ch of checks) for (const fn of ch._zod.onattach) fn(inst);
			if (checks.length === 0) {
				(_a = inst._zod).deferred ?? (_a.deferred = []);
				inst._zod.deferred?.push(() => {
					inst._zod.run = inst._zod.parse;
				});
			} else {
				const runChecks = (payload, checks, ctx) => {
					let isAborted = aborted(payload);
					let asyncResult;
					for (const ch of checks) {
						if (ch._zod.def.when) {
							if (explicitlyAborted(payload)) continue;
							if (!ch._zod.def.when(payload)) continue;
						} else if (isAborted) continue;
						const currLen = payload.issues.length;
						const _ = ch._zod.check(payload);
						if (_ instanceof Promise && ctx?.async === false) throw new $ZodAsyncError();
						if (asyncResult || _ instanceof Promise) asyncResult = (asyncResult ?? Promise.resolve()).then(async () => {
							await _;
							if (payload.issues.length === currLen) return;
							if (!isAborted) isAborted = aborted(payload, currLen);
						});
						else {
							if (payload.issues.length === currLen) continue;
							if (!isAborted) isAborted = aborted(payload, currLen);
						}
					}
					if (asyncResult) return asyncResult.then(() => {
						return payload;
					});
					return payload;
				};
				const handleCanaryResult = (canary, payload, ctx) => {
					if (aborted(canary)) {
						canary.aborted = true;
						return canary;
					}
					const checkResult = runChecks(payload, checks, ctx);
					if (checkResult instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return checkResult.then((checkResult) => inst._zod.parse(checkResult, ctx));
					}
					return inst._zod.parse(checkResult, ctx);
				};
				inst._zod.run = (payload, ctx) => {
					if (ctx.skipChecks) return inst._zod.parse(payload, ctx);
					if (ctx.direction === "backward") {
						const canary = inst._zod.parse({
							value: payload.value,
							issues: []
						}, {
							...ctx,
							skipChecks: true
						});
						if (canary instanceof Promise) return canary.then((canary) => {
							return handleCanaryResult(canary, payload, ctx);
						});
						return handleCanaryResult(canary, payload, ctx);
					}
					const result = inst._zod.parse(payload, ctx);
					if (result instanceof Promise) {
						if (ctx.async === false) throw new $ZodAsyncError();
						return result.then((result) => runChecks(result, checks, ctx));
					}
					return runChecks(result, checks, ctx);
				};
			}
			defineLazy(inst, "~standard", () => ({
				validate: (value) => {
					try {
						const r = safeParse$1(inst, value);
						return r.success ? { value: r.data } : { issues: r.error?.issues };
					} catch (_) {
						return safeParseAsync$1(inst, value).then((r) => r.success ? { value: r.data } : { issues: r.error?.issues });
					}
				},
				vendor: "zod",
				version: 1
			}));
		});
		const $ZodString = /*@__PURE__*/ $constructor("$ZodString", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = [...inst?._zod.bag?.patterns ?? []].pop() ?? string$1(inst._zod.bag);
			inst._zod.parse = (payload, _) => {
				if (def.coerce) try {
					payload.value = String(payload.value);
				} catch (_) {}
				if (typeof payload.value === "string") return payload;
				payload.issues.push({
					expected: "string",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		const $ZodStringFormat = /*@__PURE__*/ $constructor("$ZodStringFormat", (inst, def) => {
			$ZodCheckStringFormat.init(inst, def);
			$ZodString.init(inst, def);
		});
		const $ZodGUID = /*@__PURE__*/ $constructor("$ZodGUID", (inst, def) => {
			def.pattern ?? (def.pattern = guid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodUUID = /*@__PURE__*/ $constructor("$ZodUUID", (inst, def) => {
			if (def.version) {
				const v = {
					v1: 1,
					v2: 2,
					v3: 3,
					v4: 4,
					v5: 5,
					v6: 6,
					v7: 7,
					v8: 8
				}[def.version];
				if (v === void 0) throw new Error(`Invalid UUID version: "${def.version}"`);
				def.pattern ?? (def.pattern = uuid(v));
			} else def.pattern ?? (def.pattern = uuid());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodEmail = /*@__PURE__*/ $constructor("$ZodEmail", (inst, def) => {
			def.pattern ?? (def.pattern = email);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodURL = /*@__PURE__*/ $constructor("$ZodURL", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				try {
					const trimmed = payload.value.trim();
					if (!def.normalize && def.protocol?.source === httpProtocol.source) {
						if (!/^https?:\/\//i.test(trimmed)) {
							payload.issues.push({
								code: "invalid_format",
								format: "url",
								note: "Invalid URL format",
								input: payload.value,
								inst,
								continue: !def.abort
							});
							return;
						}
					}
					const url = new URL(trimmed);
					if (def.hostname) {
						def.hostname.lastIndex = 0;
						if (!def.hostname.test(url.hostname)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid hostname",
							pattern: def.hostname.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.protocol) {
						def.protocol.lastIndex = 0;
						if (!def.protocol.test(url.protocol.endsWith(":") ? url.protocol.slice(0, -1) : url.protocol)) payload.issues.push({
							code: "invalid_format",
							format: "url",
							note: "Invalid protocol",
							pattern: def.protocol.source,
							input: payload.value,
							inst,
							continue: !def.abort
						});
					}
					if (def.normalize) payload.value = url.href;
					else payload.value = trimmed;
					return;
				} catch (_) {
					payload.issues.push({
						code: "invalid_format",
						format: "url",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodEmoji = /*@__PURE__*/ $constructor("$ZodEmoji", (inst, def) => {
			def.pattern ?? (def.pattern = emoji());
			$ZodStringFormat.init(inst, def);
		});
		const $ZodNanoID = /*@__PURE__*/ $constructor("$ZodNanoID", (inst, def) => {
			def.pattern ?? (def.pattern = nanoid);
			$ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link $ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const $ZodCUID = /*@__PURE__*/ $constructor("$ZodCUID", (inst, def) => {
			def.pattern ?? (def.pattern = cuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCUID2 = /*@__PURE__*/ $constructor("$ZodCUID2", (inst, def) => {
			def.pattern ?? (def.pattern = cuid2);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodULID = /*@__PURE__*/ $constructor("$ZodULID", (inst, def) => {
			def.pattern ?? (def.pattern = ulid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodXID = /*@__PURE__*/ $constructor("$ZodXID", (inst, def) => {
			def.pattern ?? (def.pattern = xid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodKSUID = /*@__PURE__*/ $constructor("$ZodKSUID", (inst, def) => {
			def.pattern ?? (def.pattern = ksuid);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODateTime = /*@__PURE__*/ $constructor("$ZodISODateTime", (inst, def) => {
			def.pattern ?? (def.pattern = datetime$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODate = /*@__PURE__*/ $constructor("$ZodISODate", (inst, def) => {
			def.pattern ?? (def.pattern = date$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISOTime = /*@__PURE__*/ $constructor("$ZodISOTime", (inst, def) => {
			def.pattern ?? (def.pattern = time$1(def));
			$ZodStringFormat.init(inst, def);
		});
		const $ZodISODuration = /*@__PURE__*/ $constructor("$ZodISODuration", (inst, def) => {
			def.pattern ?? (def.pattern = duration$1);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodIPv4 = /*@__PURE__*/ $constructor("$ZodIPv4", (inst, def) => {
			def.pattern ?? (def.pattern = ipv4);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv4`;
		});
		const $ZodIPv6 = /*@__PURE__*/ $constructor("$ZodIPv6", (inst, def) => {
			def.pattern ?? (def.pattern = ipv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.format = `ipv6`;
			inst._zod.check = (payload) => {
				try {
					new URL(`http://[${payload.value}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "ipv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		const $ZodCIDRv4 = /*@__PURE__*/ $constructor("$ZodCIDRv4", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv4);
			$ZodStringFormat.init(inst, def);
		});
		const $ZodCIDRv6 = /*@__PURE__*/ $constructor("$ZodCIDRv6", (inst, def) => {
			def.pattern ?? (def.pattern = cidrv6);
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				const parts = payload.value.split("/");
				try {
					if (parts.length !== 2) throw new Error();
					const [address, prefix] = parts;
					if (!prefix) throw new Error();
					const prefixNum = Number(prefix);
					if (`${prefixNum}` !== prefix) throw new Error();
					if (prefixNum < 0 || prefixNum > 128) throw new Error();
					new URL(`http://[${address}]`);
				} catch {
					payload.issues.push({
						code: "invalid_format",
						format: "cidrv6",
						input: payload.value,
						inst,
						continue: !def.abort
					});
				}
			};
		});
		function isValidBase64(data) {
			if (data === "") return true;
			if (/\s/.test(data)) return false;
			if (data.length % 4 !== 0) return false;
			try {
				atob(data);
				return true;
			} catch {
				return false;
			}
		}
		const $ZodBase64 = /*@__PURE__*/ $constructor("$ZodBase64", (inst, def) => {
			def.pattern ?? (def.pattern = base64);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64";
			inst._zod.check = (payload) => {
				if (isValidBase64(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		function isValidBase64URL(data) {
			if (!base64url.test(data)) return false;
			const base64 = data.replace(/[-_]/g, (c) => c === "-" ? "+" : "/");
			return isValidBase64(base64.padEnd(Math.ceil(base64.length / 4) * 4, "="));
		}
		const $ZodBase64URL = /*@__PURE__*/ $constructor("$ZodBase64URL", (inst, def) => {
			def.pattern ?? (def.pattern = base64url);
			$ZodStringFormat.init(inst, def);
			inst._zod.bag.contentEncoding = "base64url";
			inst._zod.check = (payload) => {
				if (isValidBase64URL(payload.value)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "base64url",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodE164 = /*@__PURE__*/ $constructor("$ZodE164", (inst, def) => {
			def.pattern ?? (def.pattern = e164);
			$ZodStringFormat.init(inst, def);
		});
		function isValidJWT(token, algorithm = null) {
			try {
				const tokensParts = token.split(".");
				if (tokensParts.length !== 3) return false;
				const [header] = tokensParts;
				if (!header) return false;
				const parsedHeader = JSON.parse(atob(header));
				if ("typ" in parsedHeader && parsedHeader?.typ !== "JWT") return false;
				if (!parsedHeader.alg) return false;
				if (algorithm && (!("alg" in parsedHeader) || parsedHeader.alg !== algorithm)) return false;
				return true;
			} catch {
				return false;
			}
		}
		const $ZodJWT = /*@__PURE__*/ $constructor("$ZodJWT", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			inst._zod.check = (payload) => {
				if (isValidJWT(payload.value, def.alg)) return;
				payload.issues.push({
					code: "invalid_format",
					format: "jwt",
					input: payload.value,
					inst,
					continue: !def.abort
				});
			};
		});
		const $ZodNumber = /*@__PURE__*/ $constructor("$ZodNumber", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = inst._zod.bag.pattern ?? number$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Number(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "number" && !Number.isNaN(input) && Number.isFinite(input)) return payload;
				const received = typeof input === "number" ? Number.isNaN(input) ? "NaN" : !Number.isFinite(input) ? "Infinity" : void 0 : void 0;
				payload.issues.push({
					expected: "number",
					code: "invalid_type",
					input,
					inst,
					...received ? { received } : {}
				});
				return payload;
			};
		});
		const $ZodNumberFormat = /*@__PURE__*/ $constructor("$ZodNumberFormat", (inst, def) => {
			$ZodCheckNumberFormat.init(inst, def);
			$ZodNumber.init(inst, def);
		});
		const $ZodBoolean = /*@__PURE__*/ $constructor("$ZodBoolean", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.pattern = boolean$1;
			inst._zod.parse = (payload, _ctx) => {
				if (def.coerce) try {
					payload.value = Boolean(payload.value);
				} catch (_) {}
				const input = payload.value;
				if (typeof input === "boolean") return payload;
				payload.issues.push({
					expected: "boolean",
					code: "invalid_type",
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodUnknown = /*@__PURE__*/ $constructor("$ZodUnknown", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload) => payload;
		});
		const $ZodNever = /*@__PURE__*/ $constructor("$ZodNever", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _ctx) => {
				payload.issues.push({
					expected: "never",
					code: "invalid_type",
					input: payload.value,
					inst
				});
				return payload;
			};
		});
		function handleArrayResult(result, final, index) {
			if (result.issues.length) final.issues.push(...prefixIssues(index, result.issues));
			final.value[index] = result.value;
		}
		const $ZodArray = /*@__PURE__*/ $constructor("$ZodArray", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				if (!Array.isArray(input)) {
					payload.issues.push({
						expected: "array",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = Array(input.length);
				const proms = [];
				for (let i = 0; i < input.length; i++) {
					const item = input[i];
					const result = def.element._zod.run({
						value: item,
						issues: []
					}, ctx);
					if (result instanceof Promise) proms.push(result.then((result) => handleArrayResult(result, payload, i)));
					else handleArrayResult(result, payload, i);
				}
				if (proms.length) return Promise.all(proms).then(() => payload);
				return payload;
			};
		});
		function handlePropertyResult(result, final, key, input, isOptionalIn, isOptionalOut) {
			const isPresent = key in input;
			if (result.issues.length) {
				if (isOptionalIn && isOptionalOut && !isPresent) return;
				final.issues.push(...prefixIssues(key, result.issues));
			}
			if (!isPresent && !isOptionalIn) {
				if (!result.issues.length) final.issues.push({
					code: "invalid_type",
					expected: "nonoptional",
					input: void 0,
					path: [key]
				});
				return;
			}
			if (result.value === void 0) {
				if (isPresent) final.value[key] = void 0;
			} else final.value[key] = result.value;
		}
		function normalizeDef(def) {
			const keys = Object.keys(def.shape);
			for (const k of keys) if (!def.shape?.[k]?._zod?.traits?.has("$ZodType")) throw new Error(`Invalid element at key "${k}": expected a Zod schema`);
			const okeys = optionalKeys(def.shape);
			return {
				...def,
				keys,
				keySet: new Set(keys),
				numKeys: keys.length,
				optionalKeys: new Set(okeys)
			};
		}
		function handleCatchall(proms, input, payload, ctx, def, inst) {
			const unrecognized = [];
			const keySet = def.keySet;
			const _catchall = def.catchall._zod;
			const t = _catchall.def.type;
			const isOptionalIn = _catchall.optin === "optional";
			const isOptionalOut = _catchall.optout === "optional";
			for (const key in input) {
				if (key === "__proto__") continue;
				if (keySet.has(key)) continue;
				if (t === "never") {
					unrecognized.push(key);
					continue;
				}
				const r = _catchall.run({
					value: input[key],
					issues: []
				}, ctx);
				if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
				else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
			}
			if (unrecognized.length) payload.issues.push({
				code: "unrecognized_keys",
				keys: unrecognized,
				input,
				inst
			});
			if (!proms.length) return payload;
			return Promise.all(proms).then(() => {
				return payload;
			});
		}
		const $ZodObject = /*@__PURE__*/ $constructor("$ZodObject", (inst, def) => {
			$ZodType.init(inst, def);
			if (!Object.getOwnPropertyDescriptor(def, "shape")?.get) {
				const sh = def.shape;
				Object.defineProperty(def, "shape", { get: () => {
					const newSh = { ...sh };
					Object.defineProperty(def, "shape", { value: newSh });
					return newSh;
				} });
			}
			const _normalized = cached(() => normalizeDef(def));
			defineLazy(inst._zod, "propValues", () => {
				const shape = def.shape;
				const propValues = {};
				for (const key in shape) {
					const field = shape[key]._zod;
					if (field.values) {
						propValues[key] ?? (propValues[key] = /* @__PURE__ */ new Set());
						for (const v of field.values) propValues[key].add(v);
					}
				}
				return propValues;
			});
			const isObject$1 = isObject;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$1(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				payload.value = {};
				const proms = [];
				const shape = value.shape;
				for (const key of value.keys) {
					const el = shape[key];
					const isOptionalIn = el._zod.optin === "optional";
					const isOptionalOut = el._zod.optout === "optional";
					const r = el._zod.run({
						value: input[key],
						issues: []
					}, ctx);
					if (r instanceof Promise) proms.push(r.then((r) => handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut)));
					else handlePropertyResult(r, payload, key, input, isOptionalIn, isOptionalOut);
				}
				if (!catchall) return proms.length ? Promise.all(proms).then(() => payload) : payload;
				return handleCatchall(proms, input, payload, ctx, _normalized.value, inst);
			};
		});
		const $ZodObjectJIT = /*@__PURE__*/ $constructor("$ZodObjectJIT", (inst, def) => {
			$ZodObject.init(inst, def);
			const superParse = inst._zod.parse;
			const _normalized = cached(() => normalizeDef(def));
			const generateFastpass = (shape) => {
				const doc = new Doc([
					"shape",
					"payload",
					"ctx"
				]);
				const normalized = _normalized.value;
				const parseStr = (key) => {
					const k = esc(key);
					return `shape[${k}]._zod.run({ value: input[${k}], issues: [] }, ctx)`;
				};
				doc.write(`const input = payload.value;`);
				const ids = Object.create(null);
				let counter = 0;
				for (const key of normalized.keys) ids[key] = `key_${counter++}`;
				doc.write(`const newResult = {};`);
				for (const key of normalized.keys) {
					const id = ids[key];
					const k = esc(key);
					const schema = shape[key];
					const isOptionalIn = schema?._zod?.optin === "optional";
					const isOptionalOut = schema?._zod?.optout === "optional";
					doc.write(`const ${id} = ${parseStr(key)};`);
					if (isOptionalIn && isOptionalOut) doc.write(`
        if (${id}.issues.length) {
          if (${k} in input) {
            payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
              ...iss,
              path: iss.path ? [${k}, ...iss.path] : [${k}]
            })));
          }
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
					else if (!isOptionalIn) doc.write(`
        const ${id}_present = ${k} in input;
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        if (!${id}_present && !${id}.issues.length) {
          payload.issues.push({
            code: "invalid_type",
            expected: "nonoptional",
            input: undefined,
            path: [${k}]
          });
        }

        if (${id}_present) {
          if (${id}.value === undefined) {
            newResult[${k}] = undefined;
          } else {
            newResult[${k}] = ${id}.value;
          }
        }

      `);
					else doc.write(`
        if (${id}.issues.length) {
          payload.issues = payload.issues.concat(${id}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${k}, ...iss.path] : [${k}]
          })));
        }
        
        if (${id}.value === undefined) {
          if (${k} in input) {
            newResult[${k}] = undefined;
          }
        } else {
          newResult[${k}] = ${id}.value;
        }
        
      `);
				}
				doc.write(`payload.value = newResult;`);
				doc.write(`return payload;`);
				const fn = doc.compile();
				return (payload, ctx) => fn(shape, payload, ctx);
			};
			let fastpass;
			const isObject$2 = isObject;
			const jit = !globalConfig.jitless;
			const fastEnabled = jit && allowsEval.value;
			const catchall = def.catchall;
			let value;
			inst._zod.parse = (payload, ctx) => {
				value ?? (value = _normalized.value);
				const input = payload.value;
				if (!isObject$2(input)) {
					payload.issues.push({
						expected: "object",
						code: "invalid_type",
						input,
						inst
					});
					return payload;
				}
				if (jit && fastEnabled && ctx?.async === false && ctx.jitless !== true) {
					if (!fastpass) fastpass = generateFastpass(def.shape);
					payload = fastpass(payload, ctx);
					if (!catchall) return payload;
					return handleCatchall([], input, payload, ctx, value, inst);
				}
				return superParse(payload, ctx);
			};
		});
		function handleUnionResults(results, final, inst, ctx) {
			for (const result of results) if (result.issues.length === 0) {
				final.value = result.value;
				return final;
			}
			const nonaborted = results.filter((r) => !aborted(r));
			if (nonaborted.length === 1) {
				final.value = nonaborted[0].value;
				return nonaborted[0];
			}
			final.issues.push({
				code: "invalid_union",
				input: final.value,
				inst,
				errors: results.map((result) => result.issues.map((iss) => finalizeIssue(iss, ctx, config())))
			});
			return final;
		}
		const $ZodUnion = /*@__PURE__*/ $constructor("$ZodUnion", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.options.some((o) => o._zod.optin === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "optout", () => def.options.some((o) => o._zod.optout === "optional") ? "optional" : void 0);
			defineLazy(inst._zod, "values", () => {
				if (def.options.every((o) => o._zod.values)) return new Set(def.options.flatMap((option) => Array.from(option._zod.values)));
			});
			defineLazy(inst._zod, "pattern", () => {
				if (def.options.every((o) => o._zod.pattern)) {
					const patterns = def.options.map((o) => o._zod.pattern);
					return new RegExp(`^(${patterns.map((p) => cleanRegex(p.source)).join("|")})$`);
				}
			});
			const first = def.options.length === 1 ? def.options[0]._zod.run : null;
			inst._zod.parse = (payload, ctx) => {
				if (first) return first(payload, ctx);
				let async = false;
				const results = [];
				for (const option of def.options) {
					const result = option._zod.run({
						value: payload.value,
						issues: []
					}, ctx);
					if (result instanceof Promise) {
						results.push(result);
						async = true;
					} else {
						if (result.issues.length === 0) return result;
						results.push(result);
					}
				}
				if (!async) return handleUnionResults(results, payload, inst, ctx);
				return Promise.all(results).then((results) => {
					return handleUnionResults(results, payload, inst, ctx);
				});
			};
		});
		const $ZodIntersection = /*@__PURE__*/ $constructor("$ZodIntersection", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, ctx) => {
				const input = payload.value;
				const left = def.left._zod.run({
					value: input,
					issues: []
				}, ctx);
				const right = def.right._zod.run({
					value: input,
					issues: []
				}, ctx);
				if (left instanceof Promise || right instanceof Promise) return Promise.all([left, right]).then(([left, right]) => {
					return handleIntersectionResults(payload, left, right);
				});
				return handleIntersectionResults(payload, left, right);
			};
		});
		function mergeValues(a, b) {
			if (a === b) return {
				valid: true,
				data: a
			};
			if (a instanceof Date && b instanceof Date && +a === +b) return {
				valid: true,
				data: a
			};
			if (isPlainObject(a) && isPlainObject(b)) {
				const bKeys = Object.keys(b);
				const sharedKeys = Object.keys(a).filter((key) => bKeys.indexOf(key) !== -1);
				const newObj = {
					...a,
					...b
				};
				for (const key of sharedKeys) {
					const sharedValue = mergeValues(a[key], b[key]);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [key, ...sharedValue.mergeErrorPath]
					};
					newObj[key] = sharedValue.data;
				}
				return {
					valid: true,
					data: newObj
				};
			}
			if (Array.isArray(a) && Array.isArray(b)) {
				if (a.length !== b.length) return {
					valid: false,
					mergeErrorPath: []
				};
				const newArray = [];
				for (let index = 0; index < a.length; index++) {
					const itemA = a[index];
					const itemB = b[index];
					const sharedValue = mergeValues(itemA, itemB);
					if (!sharedValue.valid) return {
						valid: false,
						mergeErrorPath: [index, ...sharedValue.mergeErrorPath]
					};
					newArray.push(sharedValue.data);
				}
				return {
					valid: true,
					data: newArray
				};
			}
			return {
				valid: false,
				mergeErrorPath: []
			};
		}
		function handleIntersectionResults(result, left, right) {
			const unrecKeys = /* @__PURE__ */ new Map();
			let unrecIssue;
			for (const iss of left.issues) if (iss.code === "unrecognized_keys") {
				unrecIssue ?? (unrecIssue = iss);
				for (const k of iss.keys) {
					if (!unrecKeys.has(k)) unrecKeys.set(k, {});
					unrecKeys.get(k).l = true;
				}
			} else result.issues.push(iss);
			for (const iss of right.issues) if (iss.code === "unrecognized_keys") for (const k of iss.keys) {
				if (!unrecKeys.has(k)) unrecKeys.set(k, {});
				unrecKeys.get(k).r = true;
			}
			else result.issues.push(iss);
			const bothKeys = [...unrecKeys].filter(([, f]) => f.l && f.r).map(([k]) => k);
			if (bothKeys.length && unrecIssue) result.issues.push({
				...unrecIssue,
				keys: bothKeys
			});
			if (aborted(result)) return result;
			const merged = mergeValues(left.value, right.value);
			if (!merged.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(merged.mergeErrorPath)}`);
			result.value = merged.data;
			return result;
		}
		const $ZodEnum = /*@__PURE__*/ $constructor("$ZodEnum", (inst, def) => {
			$ZodType.init(inst, def);
			const values = getEnumValues(def.entries);
			const valuesSet = new Set(values);
			inst._zod.values = valuesSet;
			inst._zod.pattern = new RegExp(`^(${values.filter((k) => propertyKeyTypes.has(typeof k)).map((o) => typeof o === "string" ? escapeRegex(o) : o.toString()).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (valuesSet.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodLiteral = /*@__PURE__*/ $constructor("$ZodLiteral", (inst, def) => {
			$ZodType.init(inst, def);
			if (def.values.length === 0) throw new Error("Cannot create literal schema with no valid values");
			const values = new Set(def.values);
			inst._zod.values = values;
			inst._zod.pattern = new RegExp(`^(${def.values.map((o) => typeof o === "string" ? escapeRegex(o) : o ? escapeRegex(o.toString()) : String(o)).join("|")})$`);
			inst._zod.parse = (payload, _ctx) => {
				const input = payload.value;
				if (values.has(input)) return payload;
				payload.issues.push({
					code: "invalid_value",
					values: def.values,
					input,
					inst
				});
				return payload;
			};
		});
		const $ZodTransform = /*@__PURE__*/ $constructor("$ZodTransform", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				const _out = def.transform(payload.value, payload);
				if (ctx.async) return (_out instanceof Promise ? _out : Promise.resolve(_out)).then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				if (_out instanceof Promise) throw new $ZodAsyncError();
				payload.value = _out;
				payload.fallback = true;
				return payload;
			};
		});
		function handleOptionalResult(result, input) {
			if (input === void 0 && (result.issues.length || result.fallback)) return {
				issues: [],
				value: void 0
			};
			return result;
		}
		const $ZodOptional = /*@__PURE__*/ $constructor("$ZodOptional", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			inst._zod.optout = "optional";
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, void 0]) : void 0;
			});
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)})?$`) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (def.innerType._zod.optin === "optional") {
					const input = payload.value;
					const result = def.innerType._zod.run(payload, ctx);
					if (result instanceof Promise) return result.then((r) => handleOptionalResult(r, input));
					return handleOptionalResult(result, input);
				}
				if (payload.value === void 0) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodExactOptional = /*@__PURE__*/ $constructor("$ZodExactOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "pattern", () => def.innerType._zod.pattern);
			inst._zod.parse = (payload, ctx) => {
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNullable = /*@__PURE__*/ $constructor("$ZodNullable", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "optin", () => def.innerType._zod.optin);
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "pattern", () => {
				const pattern = def.innerType._zod.pattern;
				return pattern ? new RegExp(`^(${cleanRegex(pattern.source)}|null)$`) : void 0;
			});
			defineLazy(inst._zod, "values", () => {
				return def.innerType._zod.values ? /* @__PURE__ */ new Set([...def.innerType._zod.values, null]) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				if (payload.value === null) return payload;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodDefault = /*@__PURE__*/ $constructor("$ZodDefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) {
					payload.value = def.defaultValue;
					/**
					* $ZodDefault returns the default value immediately in forward direction.
					* It doesn't pass the default value into the validator ("prefault"). There's no reason to pass the default value through validation. The validity of the default is enforced by TypeScript statically. Otherwise, it's the responsibility of the user to ensure the default is valid. In the case of pipes with divergent in/out types, you can specify the default on the `in` schema of your ZodPipe to set a "prefault" for the pipe.   */
					return payload;
				}
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleDefaultResult(result, def));
				return handleDefaultResult(result, def);
			};
		});
		function handleDefaultResult(payload, def) {
			if (payload.value === void 0) payload.value = def.defaultValue;
			return payload;
		}
		const $ZodPrefault = /*@__PURE__*/ $constructor("$ZodPrefault", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				if (payload.value === void 0) payload.value = def.defaultValue;
				return def.innerType._zod.run(payload, ctx);
			};
		});
		const $ZodNonOptional = /*@__PURE__*/ $constructor("$ZodNonOptional", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => {
				const v = def.innerType._zod.values;
				return v ? new Set([...v].filter((x) => x !== void 0)) : void 0;
			});
			inst._zod.parse = (payload, ctx) => {
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => handleNonOptionalResult(result, inst));
				return handleNonOptionalResult(result, inst);
			};
		});
		function handleNonOptionalResult(payload, inst) {
			if (!payload.issues.length && payload.value === void 0) payload.issues.push({
				code: "invalid_type",
				expected: "nonoptional",
				input: payload.value,
				inst
			});
			return payload;
		}
		const $ZodCatch = /*@__PURE__*/ $constructor("$ZodCatch", (inst, def) => {
			$ZodType.init(inst, def);
			inst._zod.optin = "optional";
			defineLazy(inst._zod, "optout", () => def.innerType._zod.optout);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then((result) => {
					payload.value = result.value;
					if (result.issues.length) {
						payload.value = def.catchValue({
							...payload,
							error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
							input: payload.value
						});
						payload.issues = [];
						payload.fallback = true;
					}
					return payload;
				});
				payload.value = result.value;
				if (result.issues.length) {
					payload.value = def.catchValue({
						...payload,
						error: { issues: result.issues.map((iss) => finalizeIssue(iss, ctx, config())) },
						input: payload.value
					});
					payload.issues = [];
					payload.fallback = true;
				}
				return payload;
			};
		});
		const $ZodPipe = /*@__PURE__*/ $constructor("$ZodPipe", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "values", () => def.in._zod.values);
			defineLazy(inst._zod, "optin", () => def.in._zod.optin);
			defineLazy(inst._zod, "optout", () => def.out._zod.optout);
			defineLazy(inst._zod, "propValues", () => def.in._zod.propValues);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") {
					const right = def.out._zod.run(payload, ctx);
					if (right instanceof Promise) return right.then((right) => handlePipeResult(right, def.in, ctx));
					return handlePipeResult(right, def.in, ctx);
				}
				const left = def.in._zod.run(payload, ctx);
				if (left instanceof Promise) return left.then((left) => handlePipeResult(left, def.out, ctx));
				return handlePipeResult(left, def.out, ctx);
			};
		});
		function handlePipeResult(left, next, ctx) {
			if (left.issues.length) {
				left.aborted = true;
				return left;
			}
			return next._zod.run({
				value: left.value,
				issues: left.issues,
				fallback: left.fallback
			}, ctx);
		}
		const $ZodReadonly = /*@__PURE__*/ $constructor("$ZodReadonly", (inst, def) => {
			$ZodType.init(inst, def);
			defineLazy(inst._zod, "propValues", () => def.innerType._zod.propValues);
			defineLazy(inst._zod, "values", () => def.innerType._zod.values);
			defineLazy(inst._zod, "optin", () => def.innerType?._zod?.optin);
			defineLazy(inst._zod, "optout", () => def.innerType?._zod?.optout);
			inst._zod.parse = (payload, ctx) => {
				if (ctx.direction === "backward") return def.innerType._zod.run(payload, ctx);
				const result = def.innerType._zod.run(payload, ctx);
				if (result instanceof Promise) return result.then(handleReadonlyResult);
				return handleReadonlyResult(result);
			};
		});
		function handleReadonlyResult(payload) {
			payload.value = Object.freeze(payload.value);
			return payload;
		}
		const $ZodCustom = /*@__PURE__*/ $constructor("$ZodCustom", (inst, def) => {
			$ZodCheck.init(inst, def);
			$ZodType.init(inst, def);
			inst._zod.parse = (payload, _) => {
				return payload;
			};
			inst._zod.check = (payload) => {
				const input = payload.value;
				const r = def.fn(input);
				if (r instanceof Promise) return r.then((r) => handleRefineResult(r, payload, input, inst));
				handleRefineResult(r, payload, input, inst);
			};
		});
		function handleRefineResult(result, payload, input, inst) {
			if (!result) {
				const _iss = {
					code: "custom",
					input,
					inst,
					path: [...inst._zod.def.path ?? []],
					continue: !inst._zod.def.abort
				};
				if (inst._zod.def.params) _iss.params = inst._zod.def.params;
				payload.issues.push(issue(_iss));
			}
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/registries.js
		var _a;
		var $ZodRegistry = class {
			constructor() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
			}
			add(schema, ..._meta) {
				const meta = _meta[0];
				this._map.set(schema, meta);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.set(meta.id, schema);
				return this;
			}
			clear() {
				this._map = /* @__PURE__ */ new WeakMap();
				this._idmap = /* @__PURE__ */ new Map();
				return this;
			}
			remove(schema) {
				const meta = this._map.get(schema);
				if (meta && typeof meta === "object" && "id" in meta) this._idmap.delete(meta.id);
				this._map.delete(schema);
				return this;
			}
			get(schema) {
				const p = schema._zod.parent;
				if (p) {
					const pm = { ...this.get(p) ?? {} };
					delete pm.id;
					const f = {
						...pm,
						...this._map.get(schema)
					};
					return Object.keys(f).length ? f : void 0;
				}
				return this._map.get(schema);
			}
			has(schema) {
				return this._map.has(schema);
			}
		};
		function registry() {
			return new $ZodRegistry();
		}
		(_a = globalThis).__zod_globalRegistry ?? (_a.__zod_globalRegistry = registry());
		const globalRegistry = globalThis.__zod_globalRegistry;
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/api.js
		// @__NO_SIDE_EFFECTS__
		function _string(Class, params) {
			return new Class({
				type: "string",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _email(Class, params) {
			return new Class({
				type: "string",
				format: "email",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _guid(Class, params) {
			return new Class({
				type: "string",
				format: "guid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuid(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv4(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v4",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv6(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v6",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uuidv7(Class, params) {
			return new Class({
				type: "string",
				format: "uuid",
				check: "string_format",
				abort: false,
				version: "v7",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _url(Class, params) {
			return new Class({
				type: "string",
				format: "url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _emoji(Class, params) {
			return new Class({
				type: "string",
				format: "emoji",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _nanoid(Class, params) {
			return new Class({
				type: "string",
				format: "nanoid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link _cuid2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		// @__NO_SIDE_EFFECTS__
		function _cuid(Class, params) {
			return new Class({
				type: "string",
				format: "cuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cuid2(Class, params) {
			return new Class({
				type: "string",
				format: "cuid2",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ulid(Class, params) {
			return new Class({
				type: "string",
				format: "ulid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _xid(Class, params) {
			return new Class({
				type: "string",
				format: "xid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ksuid(Class, params) {
			return new Class({
				type: "string",
				format: "ksuid",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv4(Class, params) {
			return new Class({
				type: "string",
				format: "ipv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _ipv6(Class, params) {
			return new Class({
				type: "string",
				format: "ipv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv4(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv4",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _cidrv6(Class, params) {
			return new Class({
				type: "string",
				format: "cidrv6",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64(Class, params) {
			return new Class({
				type: "string",
				format: "base64",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _base64url(Class, params) {
			return new Class({
				type: "string",
				format: "base64url",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _e164(Class, params) {
			return new Class({
				type: "string",
				format: "e164",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _jwt(Class, params) {
			return new Class({
				type: "string",
				format: "jwt",
				check: "string_format",
				abort: false,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDateTime(Class, params) {
			return new Class({
				type: "string",
				format: "datetime",
				check: "string_format",
				offset: false,
				local: false,
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDate(Class, params) {
			return new Class({
				type: "string",
				format: "date",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoTime(Class, params) {
			return new Class({
				type: "string",
				format: "time",
				check: "string_format",
				precision: null,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _isoDuration(Class, params) {
			return new Class({
				type: "string",
				format: "duration",
				check: "string_format",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _number(Class, params) {
			return new Class({
				type: "number",
				checks: [],
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _int(Class, params) {
			return new Class({
				type: "number",
				check: "number_format",
				abort: false,
				format: "safeint",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _boolean(Class, params) {
			return new Class({
				type: "boolean",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _unknown(Class) {
			return new Class({ type: "unknown" });
		}
		// @__NO_SIDE_EFFECTS__
		function _never(Class, params) {
			return new Class({
				type: "never",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lt(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lte(value, params) {
			return new $ZodCheckLessThan({
				check: "less_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gt(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: false
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _gte(value, params) {
			return new $ZodCheckGreaterThan({
				check: "greater_than",
				...normalizeParams(params),
				value,
				inclusive: true
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _multipleOf(value, params) {
			return new $ZodCheckMultipleOf({
				check: "multiple_of",
				...normalizeParams(params),
				value
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _maxLength(maximum, params) {
			return new $ZodCheckMaxLength({
				check: "max_length",
				...normalizeParams(params),
				maximum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _minLength(minimum, params) {
			return new $ZodCheckMinLength({
				check: "min_length",
				...normalizeParams(params),
				minimum
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _length(length, params) {
			return new $ZodCheckLengthEquals({
				check: "length_equals",
				...normalizeParams(params),
				length
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _regex(pattern, params) {
			return new $ZodCheckRegex({
				check: "string_format",
				format: "regex",
				...normalizeParams(params),
				pattern
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _lowercase(params) {
			return new $ZodCheckLowerCase({
				check: "string_format",
				format: "lowercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _uppercase(params) {
			return new $ZodCheckUpperCase({
				check: "string_format",
				format: "uppercase",
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _includes(includes, params) {
			return new $ZodCheckIncludes({
				check: "string_format",
				format: "includes",
				...normalizeParams(params),
				includes
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _startsWith(prefix, params) {
			return new $ZodCheckStartsWith({
				check: "string_format",
				format: "starts_with",
				...normalizeParams(params),
				prefix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _endsWith(suffix, params) {
			return new $ZodCheckEndsWith({
				check: "string_format",
				format: "ends_with",
				...normalizeParams(params),
				suffix
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _overwrite(tx) {
			return new $ZodCheckOverwrite({
				check: "overwrite",
				tx
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _normalize(form) {
			return /* @__PURE__ */ _overwrite((input) => input.normalize(form));
		}
		// @__NO_SIDE_EFFECTS__
		function _trim() {
			return /* @__PURE__ */ _overwrite((input) => input.trim());
		}
		// @__NO_SIDE_EFFECTS__
		function _toLowerCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toLowerCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _toUpperCase() {
			return /* @__PURE__ */ _overwrite((input) => input.toUpperCase());
		}
		// @__NO_SIDE_EFFECTS__
		function _slugify() {
			return /* @__PURE__ */ _overwrite((input) => slugify(input));
		}
		// @__NO_SIDE_EFFECTS__
		function _array(Class, element, params) {
			return new Class({
				type: "array",
				element,
				...normalizeParams(params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _refine(Class, fn, _params) {
			return new Class({
				type: "custom",
				check: "custom",
				fn,
				...normalizeParams(_params)
			});
		}
		// @__NO_SIDE_EFFECTS__
		function _superRefine(fn, params) {
			const ch = /* @__PURE__ */ _check((payload) => {
				payload.addIssue = (issue$2) => {
					if (typeof issue$2 === "string") payload.issues.push(issue(issue$2, payload.value, ch._zod.def));
					else {
						const _issue = issue$2;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = ch);
						_issue.continue ?? (_issue.continue = !ch._zod.def.abort);
						payload.issues.push(issue(_issue));
					}
				};
				return fn(payload.value, payload);
			}, params);
			return ch;
		}
		// @__NO_SIDE_EFFECTS__
		function _check(fn, params) {
			const ch = new $ZodCheck({
				check: "custom",
				...normalizeParams(params)
			});
			ch._zod.check = fn;
			return ch;
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/to-json-schema.js
		function initializeContext(params) {
			let target = params?.target ?? "draft-2020-12";
			if (target === "draft-4") target = "draft-04";
			if (target === "draft-7") target = "draft-07";
			return {
				processors: params.processors ?? {},
				metadataRegistry: params?.metadata ?? globalRegistry,
				target,
				unrepresentable: params?.unrepresentable ?? "throw",
				override: params?.override ?? (() => {}),
				io: params?.io ?? "output",
				counter: 0,
				seen: /* @__PURE__ */ new Map(),
				cycles: params?.cycles ?? "ref",
				reused: params?.reused ?? "inline",
				external: params?.external ?? void 0
			};
		}
		function process(schema, ctx, _params = {
			path: [],
			schemaPath: []
		}) {
			var _a;
			const def = schema._zod.def;
			const seen = ctx.seen.get(schema);
			if (seen) {
				seen.count++;
				if (_params.schemaPath.includes(schema)) seen.cycle = _params.path;
				return seen.schema;
			}
			const result = {
				schema: {},
				count: 1,
				cycle: void 0,
				path: _params.path
			};
			ctx.seen.set(schema, result);
			const overrideSchema = schema._zod.toJSONSchema?.();
			if (overrideSchema) result.schema = overrideSchema;
			else {
				const params = {
					..._params,
					schemaPath: [..._params.schemaPath, schema],
					path: _params.path
				};
				if (schema._zod.processJSONSchema) schema._zod.processJSONSchema(ctx, result.schema, params);
				else {
					const _json = result.schema;
					const processor = ctx.processors[def.type];
					if (!processor) throw new Error(`[toJSONSchema]: Non-representable type encountered: ${def.type}`);
					processor(schema, ctx, _json, params);
				}
				const parent = schema._zod.parent;
				if (parent) {
					if (!result.ref) result.ref = parent;
					process(parent, ctx, params);
					ctx.seen.get(parent).isParent = true;
				}
			}
			const meta = ctx.metadataRegistry.get(schema);
			if (meta) Object.assign(result.schema, meta);
			if (ctx.io === "input" && isTransforming(schema)) {
				delete result.schema.examples;
				delete result.schema.default;
			}
			if (ctx.io === "input" && "_prefault" in result.schema) (_a = result.schema).default ?? (_a.default = result.schema._prefault);
			delete result.schema._prefault;
			return ctx.seen.get(schema).schema;
		}
		function extractDefs(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const idToSchema = /* @__PURE__ */ new Map();
			for (const entry of ctx.seen.entries()) {
				const id = ctx.metadataRegistry.get(entry[0])?.id;
				if (id) {
					const existing = idToSchema.get(id);
					if (existing && existing !== entry[0]) throw new Error(`Duplicate schema id "${id}" detected during JSON Schema conversion. Two different schemas cannot share the same id when converted together.`);
					idToSchema.set(id, entry[0]);
				}
			}
			const makeURI = (entry) => {
				const defsSegment = ctx.target === "draft-2020-12" ? "$defs" : "definitions";
				if (ctx.external) {
					const externalId = ctx.external.registry.get(entry[0])?.id;
					const uriGenerator = ctx.external.uri ?? ((id) => id);
					if (externalId) return { ref: uriGenerator(externalId) };
					const id = entry[1].defId ?? entry[1].schema.id ?? `schema${ctx.counter++}`;
					entry[1].defId = id;
					return {
						defId: id,
						ref: `${uriGenerator("__shared")}#/${defsSegment}/${id}`
					};
				}
				if (entry[1] === root) return { ref: "#" };
				const defUriPrefix = `#/${defsSegment}/`;
				const defId = entry[1].schema.id ?? `__schema${ctx.counter++}`;
				return {
					defId,
					ref: defUriPrefix + defId
				};
			};
			const extractToDef = (entry) => {
				if (entry[1].schema.$ref) return;
				const seen = entry[1];
				const { ref, defId } = makeURI(entry);
				seen.def = { ...seen.schema };
				if (defId) seen.defId = defId;
				const schema = seen.schema;
				for (const key in schema) delete schema[key];
				schema.$ref = ref;
			};
			if (ctx.cycles === "throw") for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.cycle) throw new Error(`Cycle detected: #/${seen.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`);
			}
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (schema === entry[0]) {
					extractToDef(entry);
					continue;
				}
				if (ctx.external) {
					const ext = ctx.external.registry.get(entry[0])?.id;
					if (schema !== entry[0] && ext) {
						extractToDef(entry);
						continue;
					}
				}
				if (ctx.metadataRegistry.get(entry[0])?.id) {
					extractToDef(entry);
					continue;
				}
				if (seen.cycle) {
					extractToDef(entry);
					continue;
				}
				if (seen.count > 1) {
					if (ctx.reused === "ref") {
						extractToDef(entry);
						continue;
					}
				}
			}
		}
		function finalize(ctx, schema) {
			const root = ctx.seen.get(schema);
			if (!root) throw new Error("Unprocessed schema. This is a bug in Zod.");
			const flattenRef = (zodSchema) => {
				const seen = ctx.seen.get(zodSchema);
				if (seen.ref === null) return;
				const schema = seen.def ?? seen.schema;
				const _cached = { ...schema };
				const ref = seen.ref;
				seen.ref = null;
				if (ref) {
					flattenRef(ref);
					const refSeen = ctx.seen.get(ref);
					const refSchema = refSeen.schema;
					if (refSchema.$ref && (ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0")) {
						schema.allOf = schema.allOf ?? [];
						schema.allOf.push(refSchema);
					} else Object.assign(schema, refSchema);
					Object.assign(schema, _cached);
					if (zodSchema._zod.parent === ref) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (!(key in _cached)) delete schema[key];
					}
					if (refSchema.$ref && refSeen.def) for (const key in schema) {
						if (key === "$ref" || key === "allOf") continue;
						if (key in refSeen.def && JSON.stringify(schema[key]) === JSON.stringify(refSeen.def[key])) delete schema[key];
					}
				}
				const parent = zodSchema._zod.parent;
				if (parent && parent !== ref) {
					flattenRef(parent);
					const parentSeen = ctx.seen.get(parent);
					if (parentSeen?.schema.$ref) {
						schema.$ref = parentSeen.schema.$ref;
						if (parentSeen.def) for (const key in schema) {
							if (key === "$ref" || key === "allOf") continue;
							if (key in parentSeen.def && JSON.stringify(schema[key]) === JSON.stringify(parentSeen.def[key])) delete schema[key];
						}
					}
				}
				ctx.override({
					zodSchema,
					jsonSchema: schema,
					path: seen.path ?? []
				});
			};
			for (const entry of [...ctx.seen.entries()].reverse()) flattenRef(entry[0]);
			const result = {};
			if (ctx.target === "draft-2020-12") result.$schema = "https://json-schema.org/draft/2020-12/schema";
			else if (ctx.target === "draft-07") result.$schema = "http://json-schema.org/draft-07/schema#";
			else if (ctx.target === "draft-04") result.$schema = "http://json-schema.org/draft-04/schema#";
			else if (ctx.target === "openapi-3.0") {}
			if (ctx.external?.uri) {
				const id = ctx.external.registry.get(schema)?.id;
				if (!id) throw new Error("Schema is missing an `id` property");
				result.$id = ctx.external.uri(id);
			}
			Object.assign(result, root.def ?? root.schema);
			const rootMetaId = ctx.metadataRegistry.get(schema)?.id;
			if (rootMetaId !== void 0 && result.id === rootMetaId) delete result.id;
			const defs = ctx.external?.defs ?? {};
			for (const entry of ctx.seen.entries()) {
				const seen = entry[1];
				if (seen.def && seen.defId) {
					if (seen.def.id === seen.defId) delete seen.def.id;
					defs[seen.defId] = seen.def;
				}
			}
			if (ctx.external) {} else if (Object.keys(defs).length > 0) {
				if (ctx.target === "draft-2020-12") result.$defs = defs;
				else result.definitions = defs;
			}
			try {
				const finalized = JSON.parse(JSON.stringify(result));
				Object.defineProperty(finalized, "~standard", {
					value: {
						...schema["~standard"],
						jsonSchema: {
							input: createStandardJSONSchemaMethod(schema, "input", ctx.processors),
							output: createStandardJSONSchemaMethod(schema, "output", ctx.processors)
						}
					},
					enumerable: false,
					writable: false
				});
				return finalized;
			} catch (_err) {
				throw new Error("Error converting schema to JSON.");
			}
		}
		function isTransforming(_schema, _ctx) {
			const ctx = _ctx ?? { seen: /* @__PURE__ */ new Set() };
			if (ctx.seen.has(_schema)) return false;
			ctx.seen.add(_schema);
			const def = _schema._zod.def;
			if (def.type === "transform") return true;
			if (def.type === "array") return isTransforming(def.element, ctx);
			if (def.type === "set") return isTransforming(def.valueType, ctx);
			if (def.type === "lazy") return isTransforming(def.getter(), ctx);
			if (def.type === "promise" || def.type === "optional" || def.type === "nonoptional" || def.type === "nullable" || def.type === "readonly" || def.type === "default" || def.type === "prefault") return isTransforming(def.innerType, ctx);
			if (def.type === "intersection") return isTransforming(def.left, ctx) || isTransforming(def.right, ctx);
			if (def.type === "record" || def.type === "map") return isTransforming(def.keyType, ctx) || isTransforming(def.valueType, ctx);
			if (def.type === "pipe") {
				if (_schema._zod.traits.has("$ZodCodec")) return true;
				return isTransforming(def.in, ctx) || isTransforming(def.out, ctx);
			}
			if (def.type === "object") {
				for (const key in def.shape) if (isTransforming(def.shape[key], ctx)) return true;
				return false;
			}
			if (def.type === "union") {
				for (const option of def.options) if (isTransforming(option, ctx)) return true;
				return false;
			}
			if (def.type === "tuple") {
				for (const item of def.items) if (isTransforming(item, ctx)) return true;
				if (def.rest && isTransforming(def.rest, ctx)) return true;
				return false;
			}
			return false;
		}
		/**
		* Creates a toJSONSchema method for a schema instance.
		* This encapsulates the logic of initializing context, processing, extracting defs, and finalizing.
		*/
		const createToJSONSchemaMethod = (schema, processors = {}) => (params) => {
			const ctx = initializeContext({
				...params,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		const createStandardJSONSchemaMethod = (schema, io, processors = {}) => (params) => {
			const { libraryOptions, target } = params ?? {};
			const ctx = initializeContext({
				...libraryOptions ?? {},
				target,
				io,
				processors
			});
			process(schema, ctx);
			extractDefs(ctx, schema);
			return finalize(ctx, schema);
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/core/json-schema-processors.js
		const formatMap = {
			guid: "uuid",
			url: "uri",
			datetime: "date-time",
			json_string: "json-string",
			regex: ""
		};
		const stringProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			json.type = "string";
			const { minimum, maximum, format, patterns, contentEncoding } = schema._zod.bag;
			if (typeof minimum === "number") json.minLength = minimum;
			if (typeof maximum === "number") json.maxLength = maximum;
			if (format) {
				json.format = formatMap[format] ?? format;
				if (json.format === "") delete json.format;
				if (format === "time") delete json.format;
			}
			if (contentEncoding) json.contentEncoding = contentEncoding;
			if (patterns && patterns.size > 0) {
				const regexes = [...patterns];
				if (regexes.length === 1) json.pattern = regexes[0].source;
				else if (regexes.length > 1) json.allOf = [...regexes.map((regex) => ({
					...ctx.target === "draft-07" || ctx.target === "draft-04" || ctx.target === "openapi-3.0" ? { type: "string" } : {},
					pattern: regex.source
				}))];
			}
		};
		const numberProcessor = (schema, ctx, _json, _params) => {
			const json = _json;
			const { minimum, maximum, format, multipleOf, exclusiveMaximum, exclusiveMinimum } = schema._zod.bag;
			if (typeof format === "string" && format.includes("int")) json.type = "integer";
			else json.type = "number";
			const exMin = typeof exclusiveMinimum === "number" && exclusiveMinimum >= (minimum ?? Number.NEGATIVE_INFINITY);
			const exMax = typeof exclusiveMaximum === "number" && exclusiveMaximum <= (maximum ?? Number.POSITIVE_INFINITY);
			const legacy = ctx.target === "draft-04" || ctx.target === "openapi-3.0";
			if (exMin) {
				if (legacy) {
					json.minimum = exclusiveMinimum;
					json.exclusiveMinimum = true;
				} else json.exclusiveMinimum = exclusiveMinimum;
			} else if (typeof minimum === "number") json.minimum = minimum;
			if (exMax) {
				if (legacy) {
					json.maximum = exclusiveMaximum;
					json.exclusiveMaximum = true;
				} else json.exclusiveMaximum = exclusiveMaximum;
			} else if (typeof maximum === "number") json.maximum = maximum;
			if (typeof multipleOf === "number") json.multipleOf = multipleOf;
		};
		const booleanProcessor = (_schema, _ctx, json, _params) => {
			json.type = "boolean";
		};
		const neverProcessor = (_schema, _ctx, json, _params) => {
			json.not = {};
		};
		const enumProcessor = (schema, _ctx, json, _params) => {
			const def = schema._zod.def;
			const values = getEnumValues(def.entries);
			if (values.every((v) => typeof v === "number")) json.type = "number";
			if (values.every((v) => typeof v === "string")) json.type = "string";
			json.enum = values;
		};
		const literalProcessor = (schema, ctx, json, _params) => {
			const def = schema._zod.def;
			const vals = [];
			for (const val of def.values) if (val === void 0) {
				if (ctx.unrepresentable === "throw") throw new Error("Literal `undefined` cannot be represented in JSON Schema");
			} else if (typeof val === "bigint") {
				if (ctx.unrepresentable === "throw") throw new Error("BigInt literals cannot be represented in JSON Schema");
				else vals.push(Number(val));
			} else vals.push(val);
			if (vals.length === 0) {} else if (vals.length === 1) {
				const val = vals[0];
				json.type = val === null ? "null" : typeof val;
				if (ctx.target === "draft-04" || ctx.target === "openapi-3.0") json.enum = [val];
				else json.const = val;
			} else {
				if (vals.every((v) => typeof v === "number")) json.type = "number";
				if (vals.every((v) => typeof v === "string")) json.type = "string";
				if (vals.every((v) => typeof v === "boolean")) json.type = "boolean";
				if (vals.every((v) => v === null)) json.type = "null";
				json.enum = vals;
			}
		};
		const customProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema");
		};
		const transformProcessor = (_schema, ctx, _json, _params) => {
			if (ctx.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema");
		};
		const arrayProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			const { minimum, maximum } = schema._zod.bag;
			if (typeof minimum === "number") json.minItems = minimum;
			if (typeof maximum === "number") json.maxItems = maximum;
			json.type = "array";
			json.items = process(def.element, ctx, {
				...params,
				path: [...params.path, "items"]
			});
		};
		const objectProcessor = (schema, ctx, _json, params) => {
			const json = _json;
			const def = schema._zod.def;
			json.type = "object";
			json.properties = {};
			const shape = def.shape;
			for (const key in shape) json.properties[key] = process(shape[key], ctx, {
				...params,
				path: [
					...params.path,
					"properties",
					key
				]
			});
			const allKeys = new Set(Object.keys(shape));
			const requiredKeys = new Set([...allKeys].filter((key) => {
				const v = def.shape[key]._zod;
				if (ctx.io === "input") return v.optin === void 0;
				else return v.optout === void 0;
			}));
			if (requiredKeys.size > 0) json.required = Array.from(requiredKeys);
			if (def.catchall?._zod.def.type === "never") json.additionalProperties = false;
			else if (!def.catchall) {
				if (ctx.io === "output") json.additionalProperties = false;
			} else if (def.catchall) json.additionalProperties = process(def.catchall, ctx, {
				...params,
				path: [...params.path, "additionalProperties"]
			});
		};
		const unionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const isExclusive = def.inclusive === false;
			const options = def.options.map((x, i) => process(x, ctx, {
				...params,
				path: [
					...params.path,
					isExclusive ? "oneOf" : "anyOf",
					i
				]
			}));
			if (isExclusive) json.oneOf = options;
			else json.anyOf = options;
		};
		const intersectionProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const a = process(def.left, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					0
				]
			});
			const b = process(def.right, ctx, {
				...params,
				path: [
					...params.path,
					"allOf",
					1
				]
			});
			const isSimpleIntersection = (val) => "allOf" in val && Object.keys(val).length === 1;
			json.allOf = [...isSimpleIntersection(a) ? a.allOf : [a], ...isSimpleIntersection(b) ? b.allOf : [b]];
		};
		const nullableProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			const inner = process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			if (ctx.target === "openapi-3.0") {
				seen.ref = def.innerType;
				json.nullable = true;
			} else json.anyOf = [inner, { type: "null" }];
		};
		const nonoptionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		const defaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.default = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const prefaultProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			if (ctx.io === "input") json._prefault = JSON.parse(JSON.stringify(def.defaultValue));
		};
		const catchProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			let catchValue;
			try {
				catchValue = def.catchValue(void 0);
			} catch {
				throw new Error("Dynamic catch values are not supported in JSON Schema");
			}
			json.default = catchValue;
		};
		const pipeProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			const inIsTransform = def.in._zod.traits.has("$ZodTransform");
			const innerType = ctx.io === "input" ? inIsTransform ? def.out : def.in : def.out;
			process(innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = innerType;
		};
		const readonlyProcessor = (schema, ctx, json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
			json.readOnly = true;
		};
		const optionalProcessor = (schema, ctx, _json, params) => {
			const def = schema._zod.def;
			process(def.innerType, ctx, params);
			const seen = ctx.seen.get(schema);
			seen.ref = def.innerType;
		};
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/iso.js
		const ZodISODateTime = /*@__PURE__*/ $constructor("ZodISODateTime", (inst, def) => {
			$ZodISODateTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function datetime(params) {
			return /* @__PURE__ */ _isoDateTime(ZodISODateTime, params);
		}
		const ZodISODate = /*@__PURE__*/ $constructor("ZodISODate", (inst, def) => {
			$ZodISODate.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function date(params) {
			return /* @__PURE__ */ _isoDate(ZodISODate, params);
		}
		const ZodISOTime = /*@__PURE__*/ $constructor("ZodISOTime", (inst, def) => {
			$ZodISOTime.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function time(params) {
			return /* @__PURE__ */ _isoTime(ZodISOTime, params);
		}
		const ZodISODuration = /*@__PURE__*/ $constructor("ZodISODuration", (inst, def) => {
			$ZodISODuration.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		function duration(params) {
			return /* @__PURE__ */ _isoDuration(ZodISODuration, params);
		}
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/errors.js
		const initializer = (inst, issues) => {
			$ZodError.init(inst, issues);
			inst.name = "ZodError";
			Object.defineProperties(inst, {
				format: { value: (mapper) => formatError(inst, mapper) },
				flatten: { value: (mapper) => flattenError(inst, mapper) },
				addIssue: { value: (issue) => {
					inst.issues.push(issue);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				addIssues: { value: (issues) => {
					inst.issues.push(...issues);
					inst.message = JSON.stringify(inst.issues, jsonStringifyReplacer, 2);
				} },
				isEmpty: { get() {
					return inst.issues.length === 0;
				} }
			});
		};
		const ZodRealError = /*@__PURE__*/ $constructor("ZodError", initializer, { Parent: Error });
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/parse.js
		const parse = /* @__PURE__ */ _parse(ZodRealError);
		const parseAsync = /* @__PURE__ */ _parseAsync(ZodRealError);
		const safeParse = /* @__PURE__ */ _safeParse(ZodRealError);
		const safeParseAsync = /* @__PURE__ */ _safeParseAsync(ZodRealError);
		const encode = /* @__PURE__ */ _encode(ZodRealError);
		const decode = /* @__PURE__ */ _decode(ZodRealError);
		const encodeAsync = /* @__PURE__ */ _encodeAsync(ZodRealError);
		const decodeAsync = /* @__PURE__ */ _decodeAsync(ZodRealError);
		const safeEncode = /* @__PURE__ */ _safeEncode(ZodRealError);
		const safeDecode = /* @__PURE__ */ _safeDecode(ZodRealError);
		const safeEncodeAsync = /* @__PURE__ */ _safeEncodeAsync(ZodRealError);
		const safeDecodeAsync = /* @__PURE__ */ _safeDecodeAsync(ZodRealError);
		//#endregion
		//#region node_modules/.pnpm/zod@4.4.3/node_modules/zod/v4/classic/schemas.js
		const _installedGroups = /* @__PURE__ */ new WeakMap();
		function _installLazyMethods(inst, group, methods) {
			const proto = Object.getPrototypeOf(inst);
			let installed = _installedGroups.get(proto);
			if (!installed) {
				installed = /* @__PURE__ */ new Set();
				_installedGroups.set(proto, installed);
			}
			if (installed.has(group)) return;
			installed.add(group);
			for (const key in methods) {
				const fn = methods[key];
				Object.defineProperty(proto, key, {
					configurable: true,
					enumerable: false,
					get() {
						const bound = fn.bind(this);
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: bound
						});
						return bound;
					},
					set(v) {
						Object.defineProperty(this, key, {
							configurable: true,
							writable: true,
							enumerable: true,
							value: v
						});
					}
				});
			}
		}
		const ZodType = /*@__PURE__*/ $constructor("ZodType", (inst, def) => {
			$ZodType.init(inst, def);
			Object.assign(inst["~standard"], { jsonSchema: {
				input: createStandardJSONSchemaMethod(inst, "input"),
				output: createStandardJSONSchemaMethod(inst, "output")
			} });
			inst.toJSONSchema = createToJSONSchemaMethod(inst, {});
			inst.def = def;
			inst.type = def.type;
			Object.defineProperty(inst, "_def", { value: def });
			inst.parse = (data, params) => parse(inst, data, params, { callee: inst.parse });
			inst.safeParse = (data, params) => safeParse(inst, data, params);
			inst.parseAsync = async (data, params) => parseAsync(inst, data, params, { callee: inst.parseAsync });
			inst.safeParseAsync = async (data, params) => safeParseAsync(inst, data, params);
			inst.spa = inst.safeParseAsync;
			inst.encode = (data, params) => encode(inst, data, params);
			inst.decode = (data, params) => decode(inst, data, params);
			inst.encodeAsync = async (data, params) => encodeAsync(inst, data, params);
			inst.decodeAsync = async (data, params) => decodeAsync(inst, data, params);
			inst.safeEncode = (data, params) => safeEncode(inst, data, params);
			inst.safeDecode = (data, params) => safeDecode(inst, data, params);
			inst.safeEncodeAsync = async (data, params) => safeEncodeAsync(inst, data, params);
			inst.safeDecodeAsync = async (data, params) => safeDecodeAsync(inst, data, params);
			_installLazyMethods(inst, "ZodType", {
				check(...chks) {
					const def = this.def;
					return this.clone(mergeDefs(def, { checks: [...def.checks ?? [], ...chks.map((ch) => typeof ch === "function" ? { _zod: {
						check: ch,
						def: { check: "custom" },
						onattach: []
					} } : ch)] }), { parent: true });
				},
				with(...chks) {
					return this.check(...chks);
				},
				clone(def, params) {
					return clone(this, def, params);
				},
				brand() {
					return this;
				},
				register(reg, meta) {
					reg.add(this, meta);
					return this;
				},
				refine(check, params) {
					return this.check(refine(check, params));
				},
				superRefine(refinement, params) {
					return this.check(superRefine(refinement, params));
				},
				overwrite(fn) {
					return this.check(/* @__PURE__ */ _overwrite(fn));
				},
				optional() {
					return optional(this);
				},
				exactOptional() {
					return exactOptional(this);
				},
				nullable() {
					return nullable(this);
				},
				nullish() {
					return optional(nullable(this));
				},
				nonoptional(params) {
					return nonoptional(this, params);
				},
				array() {
					return array(this);
				},
				or(arg) {
					return union([this, arg]);
				},
				and(arg) {
					return intersection(this, arg);
				},
				transform(tx) {
					return pipe(this, transform(tx));
				},
				default(d) {
					return _default(this, d);
				},
				prefault(d) {
					return prefault(this, d);
				},
				catch(params) {
					return _catch(this, params);
				},
				pipe(target) {
					return pipe(this, target);
				},
				readonly() {
					return readonly(this);
				},
				describe(description) {
					const cl = this.clone();
					globalRegistry.add(cl, { description });
					return cl;
				},
				meta(...args) {
					if (args.length === 0) return globalRegistry.get(this);
					const cl = this.clone();
					globalRegistry.add(cl, args[0]);
					return cl;
				},
				isOptional() {
					return this.safeParse(void 0).success;
				},
				isNullable() {
					return this.safeParse(null).success;
				},
				apply(fn) {
					return fn(this);
				}
			});
			Object.defineProperty(inst, "description", {
				get() {
					return globalRegistry.get(inst)?.description;
				},
				configurable: true
			});
			return inst;
		});
		/** @internal */
		const _ZodString = /*@__PURE__*/ $constructor("_ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => stringProcessor(inst, ctx, json, params);
			const bag = inst._zod.bag;
			inst.format = bag.format ?? null;
			inst.minLength = bag.minimum ?? null;
			inst.maxLength = bag.maximum ?? null;
			_installLazyMethods(inst, "_ZodString", {
				regex(...args) {
					return this.check(/* @__PURE__ */ _regex(...args));
				},
				includes(...args) {
					return this.check(/* @__PURE__ */ _includes(...args));
				},
				startsWith(...args) {
					return this.check(/* @__PURE__ */ _startsWith(...args));
				},
				endsWith(...args) {
					return this.check(/* @__PURE__ */ _endsWith(...args));
				},
				min(...args) {
					return this.check(/* @__PURE__ */ _minLength(...args));
				},
				max(...args) {
					return this.check(/* @__PURE__ */ _maxLength(...args));
				},
				length(...args) {
					return this.check(/* @__PURE__ */ _length(...args));
				},
				nonempty(...args) {
					return this.check(/* @__PURE__ */ _minLength(1, ...args));
				},
				lowercase(params) {
					return this.check(/* @__PURE__ */ _lowercase(params));
				},
				uppercase(params) {
					return this.check(/* @__PURE__ */ _uppercase(params));
				},
				trim() {
					return this.check(/* @__PURE__ */ _trim());
				},
				normalize(...args) {
					return this.check(/* @__PURE__ */ _normalize(...args));
				},
				toLowerCase() {
					return this.check(/* @__PURE__ */ _toLowerCase());
				},
				toUpperCase() {
					return this.check(/* @__PURE__ */ _toUpperCase());
				},
				slugify() {
					return this.check(/* @__PURE__ */ _slugify());
				}
			});
		});
		const ZodString = /*@__PURE__*/ $constructor("ZodString", (inst, def) => {
			$ZodString.init(inst, def);
			_ZodString.init(inst, def);
			inst.email = (params) => inst.check(/* @__PURE__ */ _email(ZodEmail, params));
			inst.url = (params) => inst.check(/* @__PURE__ */ _url(ZodURL, params));
			inst.jwt = (params) => inst.check(/* @__PURE__ */ _jwt(ZodJWT, params));
			inst.emoji = (params) => inst.check(/* @__PURE__ */ _emoji(ZodEmoji, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.uuid = (params) => inst.check(/* @__PURE__ */ _uuid(ZodUUID, params));
			inst.uuidv4 = (params) => inst.check(/* @__PURE__ */ _uuidv4(ZodUUID, params));
			inst.uuidv6 = (params) => inst.check(/* @__PURE__ */ _uuidv6(ZodUUID, params));
			inst.uuidv7 = (params) => inst.check(/* @__PURE__ */ _uuidv7(ZodUUID, params));
			inst.nanoid = (params) => inst.check(/* @__PURE__ */ _nanoid(ZodNanoID, params));
			inst.guid = (params) => inst.check(/* @__PURE__ */ _guid(ZodGUID, params));
			inst.cuid = (params) => inst.check(/* @__PURE__ */ _cuid(ZodCUID, params));
			inst.cuid2 = (params) => inst.check(/* @__PURE__ */ _cuid2(ZodCUID2, params));
			inst.ulid = (params) => inst.check(/* @__PURE__ */ _ulid(ZodULID, params));
			inst.base64 = (params) => inst.check(/* @__PURE__ */ _base64(ZodBase64, params));
			inst.base64url = (params) => inst.check(/* @__PURE__ */ _base64url(ZodBase64URL, params));
			inst.xid = (params) => inst.check(/* @__PURE__ */ _xid(ZodXID, params));
			inst.ksuid = (params) => inst.check(/* @__PURE__ */ _ksuid(ZodKSUID, params));
			inst.ipv4 = (params) => inst.check(/* @__PURE__ */ _ipv4(ZodIPv4, params));
			inst.ipv6 = (params) => inst.check(/* @__PURE__ */ _ipv6(ZodIPv6, params));
			inst.cidrv4 = (params) => inst.check(/* @__PURE__ */ _cidrv4(ZodCIDRv4, params));
			inst.cidrv6 = (params) => inst.check(/* @__PURE__ */ _cidrv6(ZodCIDRv6, params));
			inst.e164 = (params) => inst.check(/* @__PURE__ */ _e164(ZodE164, params));
			inst.datetime = (params) => inst.check(datetime(params));
			inst.date = (params) => inst.check(date(params));
			inst.time = (params) => inst.check(time(params));
			inst.duration = (params) => inst.check(duration(params));
		});
		function string(params) {
			return /* @__PURE__ */ _string(ZodString, params);
		}
		const ZodStringFormat = /*@__PURE__*/ $constructor("ZodStringFormat", (inst, def) => {
			$ZodStringFormat.init(inst, def);
			_ZodString.init(inst, def);
		});
		const ZodEmail = /*@__PURE__*/ $constructor("ZodEmail", (inst, def) => {
			$ZodEmail.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodGUID = /*@__PURE__*/ $constructor("ZodGUID", (inst, def) => {
			$ZodGUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodUUID = /*@__PURE__*/ $constructor("ZodUUID", (inst, def) => {
			$ZodUUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodURL = /*@__PURE__*/ $constructor("ZodURL", (inst, def) => {
			$ZodURL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodEmoji = /*@__PURE__*/ $constructor("ZodEmoji", (inst, def) => {
			$ZodEmoji.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNanoID = /*@__PURE__*/ $constructor("ZodNanoID", (inst, def) => {
			$ZodNanoID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		/**
		* @deprecated CUID v1 is deprecated by its authors due to information leakage
		* (timestamps embedded in the id). Use {@link ZodCUID2} instead.
		* See https://github.com/paralleldrive/cuid.
		*/
		const ZodCUID = /*@__PURE__*/ $constructor("ZodCUID", (inst, def) => {
			$ZodCUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCUID2 = /*@__PURE__*/ $constructor("ZodCUID2", (inst, def) => {
			$ZodCUID2.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodULID = /*@__PURE__*/ $constructor("ZodULID", (inst, def) => {
			$ZodULID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodXID = /*@__PURE__*/ $constructor("ZodXID", (inst, def) => {
			$ZodXID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodKSUID = /*@__PURE__*/ $constructor("ZodKSUID", (inst, def) => {
			$ZodKSUID.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv4 = /*@__PURE__*/ $constructor("ZodIPv4", (inst, def) => {
			$ZodIPv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodIPv6 = /*@__PURE__*/ $constructor("ZodIPv6", (inst, def) => {
			$ZodIPv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv4 = /*@__PURE__*/ $constructor("ZodCIDRv4", (inst, def) => {
			$ZodCIDRv4.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodCIDRv6 = /*@__PURE__*/ $constructor("ZodCIDRv6", (inst, def) => {
			$ZodCIDRv6.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64 = /*@__PURE__*/ $constructor("ZodBase64", (inst, def) => {
			$ZodBase64.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodBase64URL = /*@__PURE__*/ $constructor("ZodBase64URL", (inst, def) => {
			$ZodBase64URL.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodE164 = /*@__PURE__*/ $constructor("ZodE164", (inst, def) => {
			$ZodE164.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodJWT = /*@__PURE__*/ $constructor("ZodJWT", (inst, def) => {
			$ZodJWT.init(inst, def);
			ZodStringFormat.init(inst, def);
		});
		const ZodNumber = /*@__PURE__*/ $constructor("ZodNumber", (inst, def) => {
			$ZodNumber.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => numberProcessor(inst, ctx, json, params);
			_installLazyMethods(inst, "ZodNumber", {
				gt(value, params) {
					return this.check(/* @__PURE__ */ _gt(value, params));
				},
				gte(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				min(value, params) {
					return this.check(/* @__PURE__ */ _gte(value, params));
				},
				lt(value, params) {
					return this.check(/* @__PURE__ */ _lt(value, params));
				},
				lte(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				max(value, params) {
					return this.check(/* @__PURE__ */ _lte(value, params));
				},
				int(params) {
					return this.check(int(params));
				},
				safe(params) {
					return this.check(int(params));
				},
				positive(params) {
					return this.check(/* @__PURE__ */ _gt(0, params));
				},
				nonnegative(params) {
					return this.check(/* @__PURE__ */ _gte(0, params));
				},
				negative(params) {
					return this.check(/* @__PURE__ */ _lt(0, params));
				},
				nonpositive(params) {
					return this.check(/* @__PURE__ */ _lte(0, params));
				},
				multipleOf(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				step(value, params) {
					return this.check(/* @__PURE__ */ _multipleOf(value, params));
				},
				finite() {
					return this;
				}
			});
			const bag = inst._zod.bag;
			inst.minValue = Math.max(bag.minimum ?? Number.NEGATIVE_INFINITY, bag.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null;
			inst.maxValue = Math.min(bag.maximum ?? Number.POSITIVE_INFINITY, bag.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null;
			inst.isInt = (bag.format ?? "").includes("int") || Number.isSafeInteger(bag.multipleOf ?? .5);
			inst.isFinite = true;
			inst.format = bag.format ?? null;
		});
		function number(params) {
			return /* @__PURE__ */ _number(ZodNumber, params);
		}
		const ZodNumberFormat = /*@__PURE__*/ $constructor("ZodNumberFormat", (inst, def) => {
			$ZodNumberFormat.init(inst, def);
			ZodNumber.init(inst, def);
		});
		function int(params) {
			return /* @__PURE__ */ _int(ZodNumberFormat, params);
		}
		const ZodBoolean = /*@__PURE__*/ $constructor("ZodBoolean", (inst, def) => {
			$ZodBoolean.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => booleanProcessor(inst, ctx, json, params);
		});
		function boolean(params) {
			return /* @__PURE__ */ _boolean(ZodBoolean, params);
		}
		const ZodUnknown = /*@__PURE__*/ $constructor("ZodUnknown", (inst, def) => {
			$ZodUnknown.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => void 0;
		});
		function unknown() {
			return /* @__PURE__ */ _unknown(ZodUnknown);
		}
		const ZodNever = /*@__PURE__*/ $constructor("ZodNever", (inst, def) => {
			$ZodNever.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => neverProcessor(inst, ctx, json, params);
		});
		function never(params) {
			return /* @__PURE__ */ _never(ZodNever, params);
		}
		const ZodArray = /*@__PURE__*/ $constructor("ZodArray", (inst, def) => {
			$ZodArray.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => arrayProcessor(inst, ctx, json, params);
			inst.element = def.element;
			_installLazyMethods(inst, "ZodArray", {
				min(n, params) {
					return this.check(/* @__PURE__ */ _minLength(n, params));
				},
				nonempty(params) {
					return this.check(/* @__PURE__ */ _minLength(1, params));
				},
				max(n, params) {
					return this.check(/* @__PURE__ */ _maxLength(n, params));
				},
				length(n, params) {
					return this.check(/* @__PURE__ */ _length(n, params));
				},
				unwrap() {
					return this.element;
				}
			});
		});
		function array(element, params) {
			return /* @__PURE__ */ _array(ZodArray, element, params);
		}
		const ZodObject = /*@__PURE__*/ $constructor("ZodObject", (inst, def) => {
			$ZodObjectJIT.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => objectProcessor(inst, ctx, json, params);
			defineLazy(inst, "shape", () => {
				return def.shape;
			});
			_installLazyMethods(inst, "ZodObject", {
				keyof() {
					return _enum(Object.keys(this._zod.def.shape));
				},
				catchall(catchall) {
					return this.clone({
						...this._zod.def,
						catchall
					});
				},
				passthrough() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				loose() {
					return this.clone({
						...this._zod.def,
						catchall: unknown()
					});
				},
				strict() {
					return this.clone({
						...this._zod.def,
						catchall: never()
					});
				},
				strip() {
					return this.clone({
						...this._zod.def,
						catchall: void 0
					});
				},
				extend(incoming) {
					return extend(this, incoming);
				},
				safeExtend(incoming) {
					return safeExtend(this, incoming);
				},
				merge(other) {
					return merge(this, other);
				},
				pick(mask) {
					return pick(this, mask);
				},
				omit(mask) {
					return omit(this, mask);
				},
				partial(...args) {
					return partial(ZodOptional, this, args[0]);
				},
				required(...args) {
					return required(ZodNonOptional, this, args[0]);
				}
			});
		});
		function object(shape, params) {
			const def = {
				type: "object",
				shape: shape ?? {},
				...normalizeParams(params)
			};
			return new ZodObject(def);
		}
		const ZodUnion = /*@__PURE__*/ $constructor("ZodUnion", (inst, def) => {
			$ZodUnion.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => unionProcessor(inst, ctx, json, params);
			inst.options = def.options;
		});
		function union(options, params) {
			return new ZodUnion({
				type: "union",
				options,
				...normalizeParams(params)
			});
		}
		const ZodIntersection = /*@__PURE__*/ $constructor("ZodIntersection", (inst, def) => {
			$ZodIntersection.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => intersectionProcessor(inst, ctx, json, params);
		});
		function intersection(left, right) {
			return new ZodIntersection({
				type: "intersection",
				left,
				right
			});
		}
		const ZodEnum = /*@__PURE__*/ $constructor("ZodEnum", (inst, def) => {
			$ZodEnum.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => enumProcessor(inst, ctx, json, params);
			inst.enum = def.entries;
			inst.options = Object.values(def.entries);
			const keys = new Set(Object.keys(def.entries));
			inst.extract = (values, params) => {
				const newEntries = {};
				for (const value of values) if (keys.has(value)) newEntries[value] = def.entries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
			inst.exclude = (values, params) => {
				const newEntries = { ...def.entries };
				for (const value of values) if (keys.has(value)) delete newEntries[value];
				else throw new Error(`Key ${value} not found in enum`);
				return new ZodEnum({
					...def,
					checks: [],
					...normalizeParams(params),
					entries: newEntries
				});
			};
		});
		function _enum(values, params) {
			const entries = Array.isArray(values) ? Object.fromEntries(values.map((v) => [v, v])) : values;
			return new ZodEnum({
				type: "enum",
				entries,
				...normalizeParams(params)
			});
		}
		const ZodLiteral = /*@__PURE__*/ $constructor("ZodLiteral", (inst, def) => {
			$ZodLiteral.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => literalProcessor(inst, ctx, json, params);
			inst.values = new Set(def.values);
			Object.defineProperty(inst, "value", { get() {
				if (def.values.length > 1) throw new Error("This schema contains multiple valid literal values. Use `.values` instead.");
				return def.values[0];
			} });
		});
		function literal(value, params) {
			return new ZodLiteral({
				type: "literal",
				values: Array.isArray(value) ? value : [value],
				...normalizeParams(params)
			});
		}
		const ZodTransform = /*@__PURE__*/ $constructor("ZodTransform", (inst, def) => {
			$ZodTransform.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => transformProcessor(inst, ctx, json, params);
			inst._zod.parse = (payload, _ctx) => {
				if (_ctx.direction === "backward") throw new $ZodEncodeError(inst.constructor.name);
				payload.addIssue = (issue$1) => {
					if (typeof issue$1 === "string") payload.issues.push(issue(issue$1, payload.value, def));
					else {
						const _issue = issue$1;
						if (_issue.fatal) _issue.continue = false;
						_issue.code ?? (_issue.code = "custom");
						_issue.input ?? (_issue.input = payload.value);
						_issue.inst ?? (_issue.inst = inst);
						payload.issues.push(issue(_issue));
					}
				};
				const output = def.transform(payload.value, payload);
				if (output instanceof Promise) return output.then((output) => {
					payload.value = output;
					payload.fallback = true;
					return payload;
				});
				payload.value = output;
				payload.fallback = true;
				return payload;
			};
		});
		function transform(fn) {
			return new ZodTransform({
				type: "transform",
				transform: fn
			});
		}
		const ZodOptional = /*@__PURE__*/ $constructor("ZodOptional", (inst, def) => {
			$ZodOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function optional(innerType) {
			return new ZodOptional({
				type: "optional",
				innerType
			});
		}
		const ZodExactOptional = /*@__PURE__*/ $constructor("ZodExactOptional", (inst, def) => {
			$ZodExactOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => optionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function exactOptional(innerType) {
			return new ZodExactOptional({
				type: "optional",
				innerType
			});
		}
		const ZodNullable = /*@__PURE__*/ $constructor("ZodNullable", (inst, def) => {
			$ZodNullable.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nullableProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nullable(innerType) {
			return new ZodNullable({
				type: "nullable",
				innerType
			});
		}
		const ZodDefault = /*@__PURE__*/ $constructor("ZodDefault", (inst, def) => {
			$ZodDefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => defaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeDefault = inst.unwrap;
		});
		function _default(innerType, defaultValue) {
			return new ZodDefault({
				type: "default",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodPrefault = /*@__PURE__*/ $constructor("ZodPrefault", (inst, def) => {
			$ZodPrefault.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => prefaultProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function prefault(innerType, defaultValue) {
			return new ZodPrefault({
				type: "prefault",
				innerType,
				get defaultValue() {
					return typeof defaultValue === "function" ? defaultValue() : shallowClone(defaultValue);
				}
			});
		}
		const ZodNonOptional = /*@__PURE__*/ $constructor("ZodNonOptional", (inst, def) => {
			$ZodNonOptional.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => nonoptionalProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function nonoptional(innerType, params) {
			return new ZodNonOptional({
				type: "nonoptional",
				innerType,
				...normalizeParams(params)
			});
		}
		const ZodCatch = /*@__PURE__*/ $constructor("ZodCatch", (inst, def) => {
			$ZodCatch.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => catchProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
			inst.removeCatch = inst.unwrap;
		});
		function _catch(innerType, catchValue) {
			return new ZodCatch({
				type: "catch",
				innerType,
				catchValue: typeof catchValue === "function" ? catchValue : () => catchValue
			});
		}
		const ZodPipe = /*@__PURE__*/ $constructor("ZodPipe", (inst, def) => {
			$ZodPipe.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => pipeProcessor(inst, ctx, json, params);
			inst.in = def.in;
			inst.out = def.out;
		});
		function pipe(in_, out) {
			return new ZodPipe({
				type: "pipe",
				in: in_,
				out
			});
		}
		const ZodReadonly = /*@__PURE__*/ $constructor("ZodReadonly", (inst, def) => {
			$ZodReadonly.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => readonlyProcessor(inst, ctx, json, params);
			inst.unwrap = () => inst._zod.def.innerType;
		});
		function readonly(innerType) {
			return new ZodReadonly({
				type: "readonly",
				innerType
			});
		}
		const ZodCustom = /*@__PURE__*/ $constructor("ZodCustom", (inst, def) => {
			$ZodCustom.init(inst, def);
			ZodType.init(inst, def);
			inst._zod.processJSONSchema = (ctx, json, params) => customProcessor(inst, ctx, json, params);
		});
		function refine(fn, _params = {}) {
			return /* @__PURE__ */ _refine(ZodCustom, fn, _params);
		}
		function superRefine(fn, params) {
			return /* @__PURE__ */ _superRefine(fn, params);
		}
		//#endregion
		//#region packages/workbench/lib/typert.contract-mNsUgZm4.js
		/**
		* The wire contract between the Host service and the browser half.
		*
		* WHY THIS FILE EXISTS — read before "simplifying" it away
		* --------------------------------------------------------
		* `@deepseek-ai/dsh-typert-generator` cannot emit this package's Typert
		* artifacts. Its `isTypeMetaSymbol` recognizes a `@Remote` decorator only when
		* the protocol's declaration file belongs to a package registered in the
		* analysis workspace (physically under the repository's `packages/`) or sits
		* inside an ambient `declare module '@deepseek-ai/dsh-typert-protocol'`. In a
		* standalone plugin repository the protocol resolves from `node_modules`, so
		* neither holds: the generator collects zero invocations and fails the build
		* with "publishes Remote artifacts but has no Remote methods". Verified against
		* generator 0.2.0-rc.2 and 0.2.1-alpha.2, and reproduced on the reference plugin
		* `dsh-mcp-mcp-status` — whose committed artifacts still install and run, because
		* installing consumes them and never regenerates them.
		*
		* Nothing else is lost. The generator's decorator-lowering half is redundant
		* here: it only matches TypeScript sources, every bundle entry is already a
		* tsc-emitted `.js`, and `tsc` lowers standard decorators itself.
		*
		* So the generated artifacts are maintained here by hand instead, and the
		* contract is declared ONCE here and projected into both `typert.host.ts` and
		* `typert.remote-client.ts` so the two faces cannot drift apart.
		*
		* Writing it by hand is also strictly less duplication than the generator's
		* output, which emits the same zod schemas twice — once in the Host artifact and
		* again in the Client artifact (see `dsh-mcp-mcp-status`'s committed pair). Both
		* faces import this one list, so the schemas exist once.
		*
		* THE SAFETY NET: `tests/remote-contract.spec.ts` instantiates the real
		* `WorkbenchService` and asserts that `remoteMethods(service)` — the markers the
		* protocol reads off the live class prototype — matches these descriptors
		* entry for entry. Adding or renaming a `@Remote` method without updating this
		* file fails the test; it is not left to reviewer memory.
		*
		* @see ../../../../DESIGN.md §2, §4.1, §7
		*/
		/** npm package name; also the Remote contribution's owning identity. */
		const PACKAGE_NAME = "dsh-plugin-workbench";
		/** Cordis service key, and the wire namespace the client calls it under. */
		const SERVICE_KEY = "workbench";
		/**
		* Memoize a schema constructor.
		*
		* `TypertCodec.create` is documented as materializing the schema "on first
		* boundary use", so the protocol may call it on every invocation; rebuilding a
		* nested record schema each time would be pure waste. The generator emits the
		* same `??=` shape, so this is its idiom rather than a local invention.
		*/
		function lazy(build) {
			let value;
			return () => value ??= build();
		}
		/**
		* Build a strict codec for one boundary type.
		*
		* `typeSymbol` is `${package}/types#${TypeName}` — the exact spelling the
		* generator uses for a named export of the package's `./types` entry, which is
		* what makes these artifacts interchangeable with generated ones.
		*/
		function codec(typeName, create) {
			return {
				mode: "strict",
				typeSymbol: `${PACKAGE_NAME}/types#${typeName}`,
				create
			};
		}
		/**
		* Build a JSON parameter descriptor.
		*
		* Every P1 method takes a single named request object rather than a positional
		* list: it keeps the wire `args` legible, and it lets a later field be added
		* without renumbering anything. `wire` matches `name` because no renaming is
		* needed for an object parameter.
		*/
		function param(name, typeName, create) {
			return {
				name,
				wire: name,
				source: "json",
				codec: codec(typeName, create)
			};
		}
		/** Mirrors {@link WorkItemStatus}. */
		const statusSchema = lazy(() => _enum([
			"open",
			"in_progress",
			"done"
		]));
		/** Mirrors {@link ChangedFile}. */
		const changedFileSchema = lazy(() => object({
			path: string(),
			purpose: string()
		}).readonly());
		/** Mirrors {@link VerificationEntry}. */
		const verificationEntrySchema = lazy(() => object({
			command: string(),
			result: _enum([
				"passed",
				"failed",
				"skipped"
			]),
			note: string().optional()
		}).readonly());
		/** Mirrors {@link WorkbenchCompletion}. */
		const completionSchema = lazy(() => object({
			summary: string(),
			implementationPath: array(string()).readonly(),
			changedFiles: array(changedFileSchema()).readonly(),
			verification: array(verificationEntrySchema()).readonly(),
			completedAt: string(),
			completedBy: _enum(["model", "user"])
		}).readonly());
		/** Mirrors {@link WorkItemRecord}. */
		const workItemRecordSchema = lazy(() => object({
			id: string(),
			workspaceId: string(),
			workspacePath: string(),
			title: string(),
			desc: string(),
			tag: string(),
			status: statusSchema(),
			archived: boolean(),
			archivedAt: string().optional(),
			updateAt: string(),
			createdAt: string(),
			completion: completionSchema().optional()
		}).readonly());
		/** Mirrors {@link WorkbenchArchivedScope}. */
		const archivedScopeSchema = lazy(() => _enum([
			"exclude",
			"include",
			"only"
		]));
		const probeValueSchema = lazy(() => object({
			domain: string(),
			itemCount: number().int().nonnegative()
		}).readonly());
		const searchRequestSchema = lazy(() => object({
			workspaceId: string().optional(),
			query: string().optional(),
			status: array(statusSchema()).readonly().optional(),
			tag: string().optional(),
			archived: archivedScopeSchema().optional(),
			offset: number().int().nonnegative().optional(),
			limit: number().int().positive().optional()
		}).readonly());
		/** Mirrors {@link WorkbenchSearchCounts}. */
		const searchCountsSchema = lazy(() => object({
			all: number().int().nonnegative(),
			active: number().int().nonnegative(),
			done: number().int().nonnegative(),
			archived: number().int().nonnegative()
		}).readonly());
		const searchValueSchema = lazy(() => object({
			items: array(workItemRecordSchema()).readonly(),
			total: number().int().nonnegative(),
			counts: searchCountsSchema()
		}).readonly());
		const createRequestSchema = lazy(() => object({
			workspaceId: string(),
			title: string(),
			desc: string().optional(),
			tag: string().optional()
		}).readonly());
		const setDescRequestSchema = lazy(() => object({
			workspaceId: string(),
			id: string(),
			desc: string(),
			mode: _enum(["replace", "append"]).optional(),
			expectedUpdateAt: string().optional()
		}).readonly());
		const updateRequestSchema = lazy(() => object({
			workspaceId: string(),
			id: string(),
			title: string().optional(),
			tag: string().optional(),
			expectedUpdateAt: string().optional()
		}).readonly());
		const requestCompleteRequestSchema = lazy(() => object({
			workspaceId: string(),
			id: string(),
			expectedUpdateAt: string().optional()
		}).readonly());
		const deleteRequestSchema = lazy(() => object({
			workspaceId: string(),
			id: string()
		}).readonly());
		const archiveRequestSchema = lazy(() => object({
			workspaceId: string(),
			id: string(),
			archived: boolean(),
			expectedUpdateAt: string().optional()
		}).readonly());
		/**
		* The three ways a write and a delete differ, and the one way they do not.
		*
		* `ok` carries the record because every successful write changes `updateAt`,
		* and handing it back is what lets the caller skip a re-read. `not_found` and
		* `conflict` carry just enough to say *which* item and, for a conflict, what it
		* currently is.
		*/
		const writeValueSchema = lazy(() => union([
			object({
				code: literal("ok"),
				item: workItemRecordSchema()
			}).readonly(),
			object({
				code: literal("not_found"),
				id: string()
			}).readonly(),
			object({
				code: literal("conflict"),
				current: workItemRecordSchema()
			}).readonly(),
			object({
				code: literal("invalid"),
				message: string()
			}).readonly()
		]));
		const deleteValueSchema = lazy(() => union([
			object({
				code: literal("ok"),
				id: string()
			}).readonly(),
			object({
				code: literal("not_found"),
				id: string()
			}).readonly(),
			object({
				code: literal("conflict"),
				current: workItemRecordSchema()
			}).readonly()
		]));
		/**
		* Mirrors {@link WorkbenchChange}, the notice `watch` streams.
		*
		* Strict about all three fields because a notice has no partial reading: a bare
		* `workspaceId` would leave the pane unable to tell a coalesced duplicate from a
		* fresh write, and `at` must be a timestamp for a diagnostic log to sort.
		* `workspaceId` is required to be non-empty here even though the Host refuses to
		* publish one, so a malformed notice fails at the boundary rather than starting
		* a re-read of nothing.
		*/
		const changeSchema = lazy(() => object({
			workspaceId: string().min(1),
			revision: number().int().positive(),
			at: string()
		}).readonly());
		//#endregion
		//#region packages/workbench/lib/typert.remote-client.js
		/**
		* Hand-maintained Client-face Remote artifact — normally generated, see
		* `typert.contract.ts` for why it is written here instead.
		*
		* `packages/workbench/package.json` maps `./remote` here, and the browser half
		* mounts it with `ctx.remote.$mount(...)`. It is the same projection the
		* generator would emit: the shared contract's descriptors verbatim.
		*
		* The `declare module` block below is not decoration — it is the other half of
		* what the generator writes. `TypertRemoteNamespaceMap` is a merge-extensible
		* interface, and this block is the only thing that teaches `remote.workbench`
		* it exists. Drop it and the browser half fails to compile on
		* `ctx.remote.workbench` ("Property 'workbench' does not exist on type
		* 'ClientRemote'") even though every runtime piece is present.
		*
		* Restate it exactly as the generator would, no more and no less. The named
		* interface is declared inside this same block, so it is in scope only here —
		* a second augmentation block elsewhere cannot reference it by name.
		*
		* The generated form augments three interfaces and uses a hex-encoded namespace
		* interface name; both are reproduced here so this file stays a drop-in
		* replacement rather than a lookalike. `TypertRemoteNamespace$776f726b62656e63`
		* is "workbench" in hex.
		*
		* SIGNATURE SHAPE: every unary method takes ONE `request` argument and returns
		* `Promise<RemoteResult<Value>>`; a parameterless method takes none. Copied from
		* a real generated artifact (`dsh-api-workspace-controller`'s
		* `lib/typert.remote-client.d.ts`), including the alphabetical member order, so
		* a future diff against generator output is about content and not formatting.
		*/
		/** Client-side projection of the Host Remote contract. */
		const TYPERT_REMOTE = {
			package: PACKAGE_NAME,
			descriptors: [
				{
					id: `${PACKAGE_NAME}#${SERVICE_KEY}/probe`,
					service: SERVICE_KEY,
					namespace: SERVICE_KEY,
					method: "probe",
					invocation: { kind: "direct" },
					parameters: [],
					result: codec("WorkbenchProbeValue", probeValueSchema)
				},
				{
					id: `${PACKAGE_NAME}#${SERVICE_KEY}/search`,
					service: SERVICE_KEY,
					namespace: SERVICE_KEY,
					method: "search",
					invocation: { kind: "direct" },
					parameters: [param("request", "WorkbenchSearchRequest", searchRequestSchema)],
					result: codec("WorkbenchSearchValue", searchValueSchema)
				},
				{
					id: `${PACKAGE_NAME}#${SERVICE_KEY}/create`,
					service: SERVICE_KEY,
					namespace: SERVICE_KEY,
					method: "create",
					invocation: { kind: "direct" },
					parameters: [param("request", "WorkbenchCreateRequest", createRequestSchema)],
					result: codec("WorkbenchWriteValue", writeValueSchema)
				},
				{
					id: `${PACKAGE_NAME}#${SERVICE_KEY}/setDesc`,
					service: SERVICE_KEY,
					namespace: SERVICE_KEY,
					method: "setDesc",
					invocation: { kind: "direct" },
					parameters: [param("request", "WorkbenchSetDescRequest", setDescRequestSchema)],
					result: codec("WorkbenchWriteValue", writeValueSchema)
				},
				{
					id: `${PACKAGE_NAME}#${SERVICE_KEY}/update`,
					service: SERVICE_KEY,
					namespace: SERVICE_KEY,
					method: "update",
					invocation: { kind: "direct" },
					parameters: [param("request", "WorkbenchUpdateRequest", updateRequestSchema)],
					result: codec("WorkbenchWriteValue", writeValueSchema)
				},
				{
					id: `${PACKAGE_NAME}#${SERVICE_KEY}/requestComplete`,
					service: SERVICE_KEY,
					namespace: SERVICE_KEY,
					method: "requestComplete",
					invocation: { kind: "direct" },
					parameters: [param("request", "WorkbenchRequestCompleteRequest", requestCompleteRequestSchema)],
					result: codec("WorkbenchWriteValue", writeValueSchema)
				},
				{
					id: `${PACKAGE_NAME}#${SERVICE_KEY}/archive`,
					service: SERVICE_KEY,
					namespace: SERVICE_KEY,
					method: "archive",
					invocation: { kind: "direct" },
					parameters: [param("request", "WorkbenchArchiveRequest", archiveRequestSchema)],
					result: codec("WorkbenchWriteValue", writeValueSchema)
				},
				{
					id: `${PACKAGE_NAME}#${SERVICE_KEY}/delete`,
					service: SERVICE_KEY,
					namespace: SERVICE_KEY,
					method: "delete",
					invocation: { kind: "direct" },
					parameters: [param("request", "WorkbenchDeleteRequest", deleteRequestSchema)],
					result: codec("WorkbenchDeleteValue", deleteValueSchema)
				},
				{
					id: `${PACKAGE_NAME}#${SERVICE_KEY}/watch`,
					service: SERVICE_KEY,
					namespace: SERVICE_KEY,
					method: "watch",
					invocation: { kind: "direct" },
					mode: "stream",
					parameters: [],
					cancellation: { parameter: "signal" },
					result: codec("WorkbenchChange", changeSchema)
				}
			]
		};
		//#endregion
		//#region packages/workbench/lib/types/client/seed.js
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
		function shortNumber(id) {
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
		function seedText(item) {
			const title = item.title.trim();
			const desc = item.desc.trim();
			const head = title === "" ? "" : `${title}（待办ID：#${shortNumber(item.id)}）`;
			if (desc === "") return head;
			return head === "" ? desc : `${head}\n${desc}`;
		}
		//#endregion
		//#region packages/workbench/lib/types/client/workspace-source.js
		/**
		* The Client Workspace list, adapted for `useSyncExternalStore`.
		*
		* `ctx.workspaces.list` is a `WorkspaceSource`, and its two members are
		* *prototype* methods that read `this`:
		*
		*     subscribe(listener) { this.listeners.add(listener); ... }
		*     getSnapshot() { this.refreshSnapshot(); return this.snapshotCache }
		*
		* React invokes a `useSyncExternalStore` pair with no receiver, so handing the
		* service object over unchanged throws `Cannot read properties of undefined
		* (reading 'refreshSnapshot')` on the pane's first render.
		*
		* The failure is invisible to `tsc`: `getSnapshot(): { ... }` is a satisfied
		* method signature, and nothing in the type system records that the method needs
		* its receiver. Binding belongs here, at the one boundary where the service
		* enters this plugin, rather than at each call site — this way the injected face
		* is receiver-independent by construction and no consumer has to remember.
		*/
		/**
		* Wrap a Workspace list so its methods survive being called without a receiver.
		* @param source - the Client's Workspace list, or any equivalent source.
		* @returns a source whose methods are receiver-independent.
		*/
		function bindWorkspaceSource(source) {
			return {
				getSnapshot: () => source.getSnapshot(),
				subscribe: (listener) => source.subscribe(listener)
			};
		}
		/**
		* The workspace a pane showing this session follows (DESIGN.md §5.3).
		*
		* The pane carries no workspace picker, so this is the only way it can answer
		* "which workspace am I showing": the one the conversation it belongs to sits
		* in. That is the lookup `owningGroupKey` performs in `dsh-client-ui-workspace`
		* — a workspace row lists the sessions it holds — written out here rather than
		* taking that dependency for three lines.
		*
		* There is deliberately no fallback. A fallback would keep the pane populated
		* while it showed work items from a workspace nothing on screen names, which is
		* worse than empty: the reader cannot tell the two apart. A conversation in no
		* workspace is therefore a state the pane renders, not one it papers over.
		* @param items - the Client's Workspace rows.
		* @param sessionId - the session whose pane is asking.
		* @returns the owning workspace id, or undefined when the session is in none.
		*/
		function workspaceOfSession(items, sessionId) {
			if (sessionId === void 0) return void 0;
			return items.find((item) => item.sessionIds.includes(sessionId))?.workspaceId;
		}
		//#endregion
		//#region \0dsh-css:/Users/lanto/Projects/deepseek-plugins/dsh-plugin-workbench/packages/workbench/src/client/WorkbenchTab.module.css.mjs
		const css$1 = ".jJ6uda_pane{--wb-tertiary:color-mix(in srgb, var(--dsw-alias-label-secondary) 72%, var(--dsw-alias-bg-base));--wb-caption:color-mix(in srgb, var(--dsw-alias-label-secondary) 51%, var(--dsw-alias-bg-base));--wb-business:var(--dsw-alias-brand-primary);--wb-hover:color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);--wb-border-strong:color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent);--wb-accent-wash:color-mix(in srgb, var(--dsw-alias-brand-primary) 9%, transparent);--wb-accent:var(--dsw-alias-state-success-primary);--wb-accent-soft:color-mix(in srgb, var(--wb-accent) 15%, transparent);--wb-accent-fill:color-mix(in srgb, var(--wb-accent) 92%, var(--dsw-alias-bg-base));--wb-on-accent:var(--dsw-alias-bg-base);--wb-body:color-mix(in srgb, var(--dsw-alias-label-secondary) 92%, var(--dsw-alias-bg-base));--wb-scroll-thumb:color-mix(in srgb, var(--dsw-alias-label-primary) 16%, transparent);--wb-scroll-thumb-hover:color-mix(in srgb, var(--dsw-alias-label-primary) 30%, transparent);--wb-card-shadow:0 1px 2px #0000000a, 0 8px 20px -14px #00000038;--wb-card-shadow-hover:0 2px 4px #0000000d, 0 12px 26px -14px #00000042;width:100%;height:100%;min-height:0;color:var(--dsw-alias-label-primary);--wb-jelly:cubic-bezier(.34, 1.56, .64, 1);flex-direction:column;display:flex;container:jJ6uda_wb-pane/inline-size}.jJ6uda_toolbar{flex-direction:column;flex:none;padding:14px 16px 0;display:flex}.jJ6uda_searchRow{align-items:center;gap:8px;display:flex}.jJ6uda_searchField{border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:0;height:36px;color:var(--wb-tertiary);border-radius:13px;flex:1;align-items:center;gap:8px;padding:0 11px;transition:border-color .15s,background .15s;display:flex}.jJ6uda_searchField:focus-within{border-color:var(--wb-business);background:var(--dsw-alias-bg-base)}.jJ6uda_searchInput{min-width:0;height:100%;color:var(--dsw-alias-label-primary);font:inherit;background:0 0;border:0;outline:none;flex:1;padding:0;font-size:13px}.jJ6uda_searchInput::placeholder{color:var(--wb-caption)}.jJ6uda_filterRow{align-items:center;gap:8px;margin-top:12px;display:flex}.jJ6uda_chip{height:28px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;white-space:nowrap;background:0 0;border:.5px solid #0000;border-radius:999px;flex:none;align-items:center;gap:5px;padding:0 11px;font-size:12.5px;transition:background .13s,color .13s;display:inline-flex}.jJ6uda_chip:hover{background:var(--dsw-alias-interactive-bg-hover)}.jJ6uda_chip:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.jJ6uda_chipActive{background:var(--wb-accent-wash);color:var(--wb-business)}.jJ6uda_chipActive:hover{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 13%, transparent)}.jJ6uda_chipCount{color:inherit;opacity:.62;font-variant-numeric:tabular-nums}.jJ6uda_titleIcon{vertical-align:-2px;flex:none;margin-right:6px}.jJ6uda_filterSpacer{flex:1;min-width:0}.jJ6uda_iconBtn{width:28px;height:28px;color:var(--wb-tertiary);cursor:pointer;background:0 0;border:0;border-radius:9px;flex:none;justify-content:center;align-items:center;transition:background .13s,color .13s;display:inline-flex}.jJ6uda_iconBtn:hover{background:var(--wb-hover);color:var(--dsw-alias-label-primary)}.jJ6uda_iconBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}button[data-dockkit-tab-close=dsh-plugin-workbench\\/workbench]{display:none}.jJ6uda_scroller{scrollbar-gutter:stable;flex:1;min-height:0;padding:14px 14px 24px;overflow:auto;container-type:size}.jJ6uda_groupLabel{color:var(--wb-caption);letter-spacing:.02em;align-items:center;gap:8px;margin:4px 4px 9px;font-size:11.5px;font-weight:500;display:flex}.jJ6uda_groupLabel:after{content:\"\";background:var(--dsw-alias-border-l1);flex:1;height:.5px}.jJ6uda_list+.jJ6uda_groupLabel{margin-top:20px}.jJ6uda_list{flex-direction:column;gap:9px;margin:0;padding:0;list-style:none;display:flex}.jJ6uda_card{isolation:isolate;border:.5px solid var(--dsw-alias-border-l1);background:var(--dsw-alias-bg-base);box-shadow:var(--wb-card-shadow);border-radius:14px;padding:12px 13px 13px;font-weight:500;transition:box-shadow .16s,border-color .16s;position:relative}.jJ6uda_card:after{content:\"\";z-index:-1;border-radius:inherit;pointer-events:none;background-image:repeating-conic-gradient(from 0deg at 50% 50%, color-mix(in srgb, var(--wb-accent) 60%, transparent) 0deg 90deg, transparent 90deg 360deg);opacity:.22;background-size:6px 6px;position:absolute;inset:0;-webkit-mask-image:radial-gradient(76% 120% at 102% 2%,#000 0%,#000000a3 30%,#00000042 54%,#0000 78%);mask-image:radial-gradient(76% 120% at 102% 2%,#000 0%,#000000a3 30%,#00000042 54%,#0000 78%)}.jJ6uda_card:hover{box-shadow:var(--wb-card-shadow-hover)}.jJ6uda_cardComposing{border-color:color-mix(in srgb, var(--wb-accent) 46%, transparent)}.jJ6uda_cardDone{box-shadow:0 1px 2px #00000008}.jJ6uda_cardDone:hover{box-shadow:var(--wb-card-shadow-hover)}.jJ6uda_cardArchived{background:color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent);border-style:dashed}.jJ6uda_cardArchived .jJ6uda_mark{opacity:.55}.jJ6uda_cardArchived .jJ6uda_titleText{color:var(--wb-tertiary)}.jJ6uda_cardHead{align-items:flex-start;gap:6px;display:flex}.jJ6uda_mark{width:20px;height:20px;color:var(--dsw-alias-state-idle-primary);background:0 0;border-radius:999px;flex:none;place-items:center;margin-top:1px;transition:background .16s,color .16s;display:grid}.jJ6uda_markDot{background:currentColor;border-radius:50%;width:9px;height:9px}.jJ6uda_markDone,.jJ6uda_markBusy{background:var(--wb-accent-soft);color:var(--wb-accent)}.jJ6uda_cardBody{flex-direction:column;flex:1;min-width:0;display:flex}.jJ6uda_titleRow{align-items:center;gap:6px;min-width:0;display:flex}.jJ6uda_titleText{min-width:0;color:var(--dsw-alias-label-primary);font:inherit;letter-spacing:-.01em;text-align:left;cursor:text;text-overflow:ellipsis;white-space:nowrap;background:0 0;border:0;border-radius:6px;flex:1;margin:0;padding:0 4px;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}.jJ6uda_titleText:hover{background:var(--wb-hover)}.jJ6uda_descText{-webkit-line-clamp:2;line-clamp:2;color:var(--wb-body);font:inherit;text-align:left;white-space:pre-wrap;cursor:text;overflow-wrap:anywhere;background:0 0;border:0;border-radius:6px;-webkit-box-orient:vertical;margin:5px 0 0;padding:0 4px;font-size:12px;line-height:19px;display:-webkit-box;overflow:hidden}.jJ6uda_descText:hover{background:var(--wb-hover)}.jJ6uda_descEmpty{color:var(--wb-caption);font-style:italic}.jJ6uda_metaRow{min-width:0;color:var(--wb-body);align-items:center;gap:5px;margin-top:12px;margin-left:-26px;font-size:11.5px;line-height:17px;display:flex}.jJ6uda_metaRow>svg{color:var(--wb-caption);flex:none}.jJ6uda_metaLabel{color:inherit;flex:none}.jJ6uda_metaSpacer{flex:1;min-width:0}.jJ6uda_tag{max-width:150px;color:var(--wb-body);font:inherit;cursor:text;text-overflow:ellipsis;white-space:nowrap;background:0 0;border:.5px solid #0000;border-radius:6px;flex:none;align-items:center;padding:2px 4px;font-size:11.5px;line-height:17px;transition:background .13s,color .13s;display:inline-flex;overflow:hidden}.jJ6uda_tag:hover{background:var(--wb-hover);color:var(--dsw-alias-label-secondary)}.jJ6uda_tagEmpty{color:var(--wb-caption)}.jJ6uda_statusPill{white-space:nowrap;border:.5px solid #0000;border-radius:999px;flex:none;align-items:center;gap:4px;height:21px;padding:0 8px 0 6px;font-size:10.5px;font-weight:500;line-height:1;display:inline-flex}.jJ6uda_statusPillDone{border-color:color-mix(in srgb, var(--wb-accent) 46%, transparent);background:var(--wb-accent-soft);color:color-mix(in srgb, var(--wb-accent) 86%, var(--dsw-alias-label-primary))}.jJ6uda_statusPillBusy{border-color:color-mix(in srgb, var(--wb-business) 30%, transparent);background:color-mix(in srgb, var(--wb-business) 10%, transparent);color:var(--wb-business)}.jJ6uda_statusPip{background:currentColor;border-radius:50%;width:5px;height:5px;animation:1.8s ease-in-out infinite jJ6uda_wb-status-breathe}@keyframes jJ6uda_wb-status-breathe{0%,to{opacity:1}50%{opacity:.35}}.jJ6uda_archivedBadge{background:color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent);height:19px;color:var(--wb-caption);white-space:nowrap;border-radius:999px;flex:none;align-items:center;padding:0 7px;font-size:10px;line-height:1;display:inline-flex}.jJ6uda_time{color:var(--wb-caption);font-variant-numeric:tabular-nums;flex:none;font-size:10.5px}.jJ6uda_cardFoot{align-items:center;gap:6px;margin-top:14px;margin-left:-26px;display:flex}.jJ6uda_footSpacer{flex:1;min-width:0}.jJ6uda_primaryBtn{background:var(--wb-accent-fill);height:26px;color:var(--wb-on-accent);font:inherit;cursor:pointer;box-shadow:0 1px 2px color-mix(in srgb, var(--wb-accent) 28%, transparent);border:0;border-radius:10px;flex:none;justify-content:center;align-items:center;gap:5px;padding:0 8px;font-size:12px;font-weight:500;transition:filter .13s,box-shadow .16s;display:inline-flex}.jJ6uda_primaryBtn:hover{filter:brightness(1.06);box-shadow:0 2px 6px color-mix(in srgb, var(--wb-accent) 34%, transparent)}.jJ6uda_primaryBtn:active{filter:brightness(.95)}.jJ6uda_primaryBtn:focus-visible{outline:2px solid var(--wb-accent);outline-offset:1px}.jJ6uda_ghostBtn{border:.5px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);height:26px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:10px;flex:none;justify-content:center;align-items:center;gap:5px;padding:0 8px;font-size:12px;font-weight:500;transition:background .13s,border-color .13s,color .13s;display:inline-flex}.jJ6uda_ghostBtn:hover{background:var(--dsw-alias-bg-base);border-color:var(--wb-border-strong)}.jJ6uda_ghostBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.jJ6uda_ghostBtnBusy{border-color:color-mix(in srgb, var(--wb-business) 38%, transparent);color:var(--wb-business)}.jJ6uda_ghostBtnBusy:hover{color:var(--wb-business)}.jJ6uda_ghostBtnPending{color:var(--wb-business);cursor:default;animation:1.6s ease-in-out infinite jJ6uda_wb-writeback-wait}.jJ6uda_ghostBtnPending:hover{background:color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);border-color:var(--dsw-alias-border-l2);color:var(--wb-business)}@keyframes jJ6uda_wb-writeback-wait{0%,to{opacity:1}50%{opacity:.45}}.jJ6uda_archiveBtn{height:26px;color:var(--wb-tertiary);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:10px;flex:none;justify-content:center;align-items:center;gap:5px;padding:0 7px;font-size:12px;font-weight:500;transition:background .13s,color .13s;display:inline-flex}.jJ6uda_archiveBtn:hover{background:var(--wb-hover);color:var(--dsw-alias-label-primary)}.jJ6uda_archiveBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.jJ6uda_archiveBtnOn,.jJ6uda_archiveBtnOn:hover{color:var(--wb-business)}.jJ6uda_cardActions{flex:none;align-items:center;margin-right:-3px;display:inline-flex}.jJ6uda_chevron{min-width:0;height:26px;color:var(--wb-tertiary);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:10px;flex:0 auto;justify-content:center;align-items:center;gap:4px;padding:0 6px 0 4px;font-size:12px;font-weight:500;transition:background .13s,color .13s;display:inline-flex}.jJ6uda_chevron>span{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}@container jJ6uda_wb-pane (width<=340px){.jJ6uda_chevron>span,.jJ6uda_archiveBtn>span{display:none}.jJ6uda_chevron{padding:0 4px}.jJ6uda_archiveBtn{padding:0 6px}}.jJ6uda_chevron:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.jJ6uda_chevronOpen svg{rotate:180deg}.jJ6uda_chevron svg{transition:rotate .3s var(--wb-jelly), scale .12s ease}.jJ6uda_chevron:active svg{scale:.82}.jJ6uda_field{box-sizing:border-box;background:var(--wb-hover);width:100%;color:inherit;font:inherit;text-align:left;caret-color:var(--wb-business);border:0;border-radius:6px;outline:none;margin:0;padding:0}.jJ6uda_fieldTitle{letter-spacing:-.01em;color:var(--dsw-alias-label-primary);padding:0 4px;font-size:14px;font-weight:500;line-height:20px}.jJ6uda_fieldDesc{height:19px;max-height:38px;transition:height .24s var(--wb-jelly);resize:none;color:var(--wb-tertiary);margin-top:5px;padding:0 4px;font-size:12px;line-height:19px;display:block;overflow-y:auto}.jJ6uda_fieldTag{width:120px;color:var(--dsw-alias-label-secondary);background:var(--wb-hover);border:.5px solid #0000;border-radius:6px;flex:none;padding:2px 4px;font-size:11.5px;line-height:17px}.jJ6uda_field::placeholder{color:var(--wb-caption);font-style:normal;font-weight:500}.jJ6uda_field.jJ6uda_fieldDesc::placeholder{font-style:italic}.jJ6uda_editHint{color:var(--wb-caption);margin:6px 0 0;font-size:10px}.jJ6uda_detailWrap{transition:grid-template-rows .24s var(--wb-jelly);grid-template-rows:0fr;display:grid}.jJ6uda_detailWrap>.jJ6uda_detail{visibility:hidden;scrollbar-gutter:stable;min-height:0;max-height:50cqh;transition:visibility 0s linear .24s;overflow:hidden}.jJ6uda_detailOpen{transition:grid-template-rows .38s var(--wb-jelly);grid-template-rows:1fr}.jJ6uda_detailOpen>.jJ6uda_detail{visibility:visible;transition:visibility;animation:1ms linear .4s forwards jJ6uda_wb-detail-scrollable;overflow-x:clip}@keyframes jJ6uda_wb-detail-scrollable{to{overflow-y:auto}}.jJ6uda_detailOpen>.jJ6uda_detail::-webkit-scrollbar{width:6px;height:6px}.jJ6uda_detailOpen>.jJ6uda_detail::-webkit-scrollbar-track{background:0 0}.jJ6uda_detailOpen>.jJ6uda_detail::-webkit-scrollbar-thumb{background:var(--wb-scroll-thumb);border-radius:3px}.jJ6uda_detailOpen>.jJ6uda_detail::-webkit-scrollbar-thumb:hover{background:var(--wb-scroll-thumb-hover)}.jJ6uda_detailOpen>.jJ6uda_detail::-webkit-scrollbar-corner{background:0 0}.jJ6uda_detail{padding:6px 0 2px}.jJ6uda_detailHint{color:var(--wb-caption);margin:12px 0 0;font-size:10.5px}.jJ6uda_detailEmpty{color:var(--wb-tertiary);opacity:.7;justify-content:center;align-items:center;padding:4px 0 6px;display:flex}.jJ6uda_detailEmpty>svg{width:26px;height:26px}.jJ6uda_completionDivider{color:var(--wb-caption);letter-spacing:.02em;align-items:center;gap:8px;margin:0 0 12px;font-size:10px;font-weight:500;display:flex}.jJ6uda_completionDivider:before,.jJ6uda_completionDivider:after{content:\"\";background:var(--dsw-alias-border-l1);flex:1;height:.5px}.jJ6uda_completionSummary{color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;margin:0;font-size:11.5px;line-height:19px}.jJ6uda_completionBlockTitle{color:var(--wb-caption);margin:0 0 6px;font-size:10px;font-weight:500}.jJ6uda_completionBlock{margin:13px 0 0}.jJ6uda_completionList{flex-direction:column;gap:6px;margin:0;padding:0;font-size:11px;line-height:17px;list-style:none;display:flex}.jJ6uda_completionSteps{color:var(--dsw-alias-label-secondary);flex-direction:column;gap:6px;margin:0;padding-left:18px;font-size:11px;line-height:17px;display:flex}.jJ6uda_completionSteps li::marker{color:var(--wb-caption)}.jJ6uda_completionRow{align-items:baseline;gap:7px;display:flex}.jJ6uda_filePath{color:var(--dsw-alias-label-primary);overflow-wrap:anywhere;font-size:10.5px}.jJ6uda_filePurpose{color:var(--wb-tertiary);font-size:10.5px}.jJ6uda_verifyCmd{color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;font-size:10.5px}.jJ6uda_verifyResult{white-space:nowrap;flex:none;font-size:10px;font-weight:500}.jJ6uda_verifyPassed{color:var(--dsw-alias-state-success-primary)}.jJ6uda_verifyFailed{color:var(--dsw-alias-state-error-primary)}.jJ6uda_verifySkipped{color:var(--wb-caption)}.jJ6uda_completionBy{color:var(--wb-caption);margin:11px 0 0;font-size:10px}.jJ6uda_status{color:var(--wb-caption);margin:0;font-size:12px}.jJ6uda_statusError{color:var(--dsw-alias-state-error-primary)}.jJ6uda_retryBtn{border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);height:30px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:999px;align-self:flex-start;margin-top:8px;padding:0 13px;font-size:12.5px;transition:background .13s}.jJ6uda_retryBtn:hover{background:var(--dsw-alias-bg-layer-2)}.jJ6uda_retryBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.jJ6uda_notice{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 16%, transparent);color:var(--dsw-alias-label-primary);border-radius:12px;margin:0 0 9px;padding:9px 11px;font-size:12.5px;line-height:19px}.jJ6uda_skeletonList{flex-direction:column;gap:9px;display:flex}.jJ6uda_skeleton{background:var(--dsw-alias-bg-layer-1);border-radius:14px;height:132px;animation:1.6s ease-in-out infinite jJ6uda_wb-pulse}@keyframes jJ6uda_wb-pulse{0%,to{opacity:1}50%{opacity:.55}}@media (prefers-reduced-motion:reduce){.jJ6uda_skeleton,.jJ6uda_statusPip,.jJ6uda_ghostBtnPending{animation:none}.jJ6uda_card,.jJ6uda_archiveBtn,.jJ6uda_chevron,.jJ6uda_chevron svg,.jJ6uda_chip,.jJ6uda_detailWrap,.jJ6uda_detailWrap>.jJ6uda_detail,.jJ6uda_fieldDesc,.jJ6uda_ghostBtn,.jJ6uda_iconBtn,.jJ6uda_mark,.jJ6uda_primaryBtn,.jJ6uda_retryBtn,.jJ6uda_searchField,.jJ6uda_tag{transition:none}.jJ6uda_chevron:active svg{scale:none}.jJ6uda_detailOpen>.jJ6uda_detail{animation:none;overflow-y:auto}}.jJ6uda_empty{text-align:center;flex-direction:column;justify-content:center;align-items:center;padding:60px 24px;display:flex}.jJ6uda_emptyArt{user-select:none;width:100%;max-width:240px;height:auto;margin-bottom:8px;display:block}.jJ6uda_empty p{color:var(--wb-tertiary);margin:0;font-size:13px}.jJ6uda_pane .jJ6uda_emptyHint{color:var(--wb-caption);margin:6px 0 0;font-size:12px}";
		const tagId$1 = "dsh-plugin-workbench/WorkbenchTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-plugin-workbench";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var WorkbenchTab_module_css_default = {
			"archiveBtn": "jJ6uda_archiveBtn",
			"archiveBtnOn": "jJ6uda_archiveBtnOn",
			"archivedBadge": "jJ6uda_archivedBadge",
			"card": "jJ6uda_card",
			"cardActions": "jJ6uda_cardActions",
			"cardArchived": "jJ6uda_cardArchived",
			"cardBody": "jJ6uda_cardBody",
			"cardComposing": "jJ6uda_cardComposing",
			"cardDone": "jJ6uda_cardDone",
			"cardFoot": "jJ6uda_cardFoot",
			"cardHead": "jJ6uda_cardHead",
			"chevron": "jJ6uda_chevron",
			"chevronOpen": "jJ6uda_chevronOpen",
			"chip": "jJ6uda_chip",
			"chipActive": "jJ6uda_chipActive",
			"chipCount": "jJ6uda_chipCount",
			"completionBlock": "jJ6uda_completionBlock",
			"completionBlockTitle": "jJ6uda_completionBlockTitle",
			"completionBy": "jJ6uda_completionBy",
			"completionDivider": "jJ6uda_completionDivider",
			"completionList": "jJ6uda_completionList",
			"completionRow": "jJ6uda_completionRow",
			"completionSteps": "jJ6uda_completionSteps",
			"completionSummary": "jJ6uda_completionSummary",
			"descEmpty": "jJ6uda_descEmpty",
			"descText": "jJ6uda_descText",
			"detail": "jJ6uda_detail",
			"detailEmpty": "jJ6uda_detailEmpty",
			"detailHint": "jJ6uda_detailHint",
			"detailOpen": "jJ6uda_detailOpen",
			"detailWrap": "jJ6uda_detailWrap",
			"editHint": "jJ6uda_editHint",
			"empty": "jJ6uda_empty",
			"emptyArt": "jJ6uda_emptyArt",
			"emptyHint": "jJ6uda_emptyHint",
			"field": "jJ6uda_field",
			"fieldDesc": "jJ6uda_fieldDesc",
			"fieldTag": "jJ6uda_fieldTag",
			"fieldTitle": "jJ6uda_fieldTitle",
			"filePath": "jJ6uda_filePath",
			"filePurpose": "jJ6uda_filePurpose",
			"filterRow": "jJ6uda_filterRow",
			"filterSpacer": "jJ6uda_filterSpacer",
			"footSpacer": "jJ6uda_footSpacer",
			"ghostBtn": "jJ6uda_ghostBtn",
			"ghostBtnBusy": "jJ6uda_ghostBtnBusy",
			"ghostBtnPending": "jJ6uda_ghostBtnPending",
			"groupLabel": "jJ6uda_groupLabel",
			"iconBtn": "jJ6uda_iconBtn",
			"list": "jJ6uda_list",
			"mark": "jJ6uda_mark",
			"markBusy": "jJ6uda_markBusy",
			"markDone": "jJ6uda_markDone",
			"markDot": "jJ6uda_markDot",
			"metaLabel": "jJ6uda_metaLabel",
			"metaRow": "jJ6uda_metaRow",
			"metaSpacer": "jJ6uda_metaSpacer",
			"notice": "jJ6uda_notice",
			"pane": "jJ6uda_pane",
			"primaryBtn": "jJ6uda_primaryBtn",
			"retryBtn": "jJ6uda_retryBtn",
			"scroller": "jJ6uda_scroller",
			"searchField": "jJ6uda_searchField",
			"searchInput": "jJ6uda_searchInput",
			"searchRow": "jJ6uda_searchRow",
			"skeleton": "jJ6uda_skeleton",
			"skeletonList": "jJ6uda_skeletonList",
			"status": "jJ6uda_status",
			"statusError": "jJ6uda_statusError",
			"statusPill": "jJ6uda_statusPill",
			"statusPillBusy": "jJ6uda_statusPillBusy",
			"statusPillDone": "jJ6uda_statusPillDone",
			"statusPip": "jJ6uda_statusPip",
			"tag": "jJ6uda_tag",
			"tagEmpty": "jJ6uda_tagEmpty",
			"time": "jJ6uda_time",
			"titleIcon": "jJ6uda_titleIcon",
			"titleRow": "jJ6uda_titleRow",
			"titleText": "jJ6uda_titleText",
			"toolbar": "jJ6uda_toolbar",
			"verifyCmd": "jJ6uda_verifyCmd",
			"verifyFailed": "jJ6uda_verifyFailed",
			"verifyPassed": "jJ6uda_verifyPassed",
			"verifyResult": "jJ6uda_verifyResult",
			"verifySkipped": "jJ6uda_verifySkipped",
			"wb-detail-scrollable": "jJ6uda_wb-detail-scrollable",
			"wb-pane": "jJ6uda_wb-pane",
			"wb-pulse": "jJ6uda_wb-pulse",
			"wb-status-breathe": "jJ6uda_wb-status-breathe",
			"wb-writeback-wait": "jJ6uda_wb-writeback-wait"
		};
		//#endregion
		//#region packages/workbench/lib/types/client/WorkbenchTab.js
		/**
		* The workbench tab body.
		*
		* Everything is edited in place (DESIGN.md §5.4): a field's display state is
		* plain text and its edit state is that very box with a wash and a caret (§9.14),
		* so there are no save or revert buttons anywhere in this file. The three verbs
		* are Enter (commit this field), blur (commit too — clicking away is not a
		* cancel), and Escape (revert).
		* Only `desc` differs, because it is the one multi-line field: Enter inserts a
		* newline there instead of committing.
		*
		* Status is never interactive. It is derived — `done` is set by a write-back and
		* by nothing else — so rendering it as something clickable would offer an action
		* the Host does not have.
		*/
		/** One formatter for the module; constructing one per render is the slow path. */
		const RELATIVE = new Intl.RelativeTimeFormat(void 0, { numeric: "auto" });
		/**
		* Compact "time since" for a card's right edge.
		*
		* The first minute is worded rather than counted: every action re-renders the
		* pane, so a card that recounted its seconds would appear to tick whenever the
		* user merely clicks around it. Below a minute the card therefore says the same
		* thing, and only then does the stamp start to move — a minute at a time.
		* @param iso - the record's `updateAt`.
		* @param justNow - the localized wording for "less than a minute ago".
		* @returns the age, or `''` when the stamp cannot be parsed.
		*/
		function relative(iso, justNow) {
			const then = Date.parse(iso);
			if (Number.isNaN(then)) return "";
			const seconds = Math.round((then - Date.now()) / 1e3);
			const magnitude = Math.abs(seconds);
			if (magnitude < 60) return justNow;
			if (magnitude < 3600) return RELATIVE.format(Math.round(seconds / 60), "minute");
			if (magnitude < 86400) return RELATIVE.format(Math.round(seconds / 3600), "hour");
			if (magnitude < 2592e3) return RELATIVE.format(Math.round(seconds / 86400), "day");
			if (magnitude < 31536e3) return RELATIVE.format(Math.round(seconds / 2592e3), "month");
			return RELATIVE.format(Math.round(seconds / 31536e3), "year");
		}
		/**
		* How long the pane watches for a queued write-back to be answered.
		*
		* A write-back is a queued user turn, so it lands whenever the model gets to it —
		* seconds later, or after a whole turn of other work. Nothing pushes the answer
		* into this pane, because it is written into the Host's record and no event
		* carries it (§9.19), so the pane re-reads on a slow timer instead: often enough
		* to feel immediate, rarely enough that a model working for a minute costs tens
		* of queries rather than thousands. The budget ends the watch, so a model that
		* never writes anything costs one minute of quiet re-reads and then hands the
		* control back to the user, who can simply ask again.
		*/
		const WRITE_BACK_INTERVAL_MS = 1500;
		const WRITE_BACK_TICKS = 40;
		/** Render the workbench pane. */
		function WorkbenchTab(props) {
			const { workspaces, t, requestWriteBack: queueWriteBack } = props;
			const tabInfo = props.useTabInfo();
			const store = props.storeFor(props.sessionId);
			const snapshot = (0, react.useSyncExternalStore)(store.subscribe, store.getSnapshot);
			const workspaceItems = (0, react.useSyncExternalStore)(workspaces.subscribe, workspaces.getSnapshot).items;
			const [editing, setEditing] = (0, react.useState)({ kind: "none" });
			const [expanded, setExpanded] = (0, react.useState)([]);
			const [notice, setNotice] = (0, react.useState)(void 0);
			/**
			* The item whose write-back request has been sent and has not settled yet.
			*
			* One at a time, deliberately: §11.4 forbids initiating a second write-back
			* while one is pending, so the pane holds an id rather than a set of them. It
			* exists for two reasons — the control says so while the model works, and the
			* settle effect below knows which item to re-read.
			*/
			const [writeBack, setWriteBack] = (0, react.useState)(void 0);
			const visible = tabInfo.tab.visible;
			const followed = workspaceOfSession(workspaceItems, props.sessionId) ?? "";
			/**
			* Follow that workspace, and re-read it when the pane comes back into view.
			*
			* One effect rather than two: pointing the store at a workspace already starts
			* its load, so a separate refresh pass would fire a second request for the same
			* list on every first open. Here the follow and the re-read of Tier 2 (§6.2)
			* are mutually exclusive branches of a single pass.
			*/
			(0, react.useEffect)(() => {
				if (!visible) return;
				if (followed !== store.workspaceId) {
					setEditing((current) => current.kind === "none" ? current : { kind: "none" });
					store.setWorkspace(followed);
					return;
				}
				if (followed !== "") store.refresh();
			}, [
				store,
				followed,
				visible
			]);
			/**
			* Watch a queued write-back until its record says it is done.
			*
			* The effect depends on the id alone — deliberately not on the live snapshot.
			* An earlier version read the store's own snapshot as a dependency *and*
			* refreshed it from inside the same effect, so every store change re-armed the
			* effect, which refreshed again: a render loop that crashed the whole pane
			* (React #185). Reading the record inside the callback, and re-reading only on
			* the timer, keeps the effect running exactly twice per request: once when the
			* click arms it, once when it clears itself.
			*
			* Two readings end it: the record reaching `done` (the completion is in the
			* Host's record, which is why it is fetched rather than merged), or the record
			* leaving the current tier altogether, which is what a completed item does
			* under the active tier (§5.3).
			*/
			(0, react.useEffect)(() => {
				if (writeBack === void 0) return;
				const id = writeBack;
				let ticks = 0;
				let timer = 0;
				let stopped = false;
				const answer = () => {
					if (stopped) return;
					const status = store.getSnapshot().items.find((entry) => entry.id === id)?.status;
					if (status === "done" || status === void 0 || ticks >= WRITE_BACK_TICKS) {
						stopped = true;
						window.clearInterval(timer);
						setWriteBack(void 0);
					}
				};
				const tick = () => {
					ticks += 1;
					store.refresh().then(answer);
				};
				timer = window.setInterval(tick, WRITE_BACK_INTERVAL_MS);
				tick();
				return () => {
					stopped = true;
					window.clearInterval(timer);
				};
			}, [writeBack, store]);
			const { active, done } = (0, react.useMemo)(() => {
				const open = [];
				const finished = [];
				for (const item of snapshot.items) (item.status === "done" ? finished : open).push(item);
				return {
					active: open,
					done: finished
				};
			}, [snapshot.items]);
			const inputActions = props.inputActions;
			/** A face that can write nothing would only produce a dead control. */
			const canFill = inputActions !== void 0 && (inputActions.insertText !== void 0 || inputActions.setDraft !== void 0);
			/**
			* Put one work item into the composer's draft — filling, never submitting.
			*
			* `insertText` is the non-destructive path: it lands at the caret, keeps
			* whatever the user already typed, and is one undo step. It is
			* revision-guarded and refuses when the draft moved under us or the editor is
			* locked, in which case `setDraft` keeps the click from being a silent no-op.
			* @param item - the work item to hand over.
			*/
			const fillComposer = (item) => {
				const text = seedText(item);
				if (text === "" || inputActions === void 0) return;
				const span = inputActions.captureInsertion?.();
				if (!(span !== void 0 && inputActions.insertText?.(text, span) === true)) inputActions.setDraft?.(text);
				inputActions.focus?.();
			};
			/** Report a failed write and re-sync whatever the Host says is current. */
			const report = (result) => {
				if (result.code === "conflict") {
					if (result.current !== void 0) store.adoptConflict(result.current);
					setNotice(t("error.conflict"));
					return;
				}
				if (result.code === "not_found") {
					setNotice(t("error.notFound"));
					store.refresh();
					return;
				}
				if (result.code === "invalid") setNotice(t("error.invalid", { message: result.message ?? "" }));
			};
			/** Commit one inline field, clearing the editor only when the Host accepted. */
			const commit = async (item, field, draft) => {
				setNotice(void 0);
				const result = field === "desc" ? await store.setDesc(item, draft) : await store.update(item, { [field]: draft });
				if (result.code === "ok") {
					setEditing({ kind: "none" });
					return;
				}
				report(result);
				setEditing({ kind: "none" });
			};
			/**
			* Ask for this item's write-back: both halves of §11.3 in one action.
			*
			* The Host records the request first — the `open → in_progress` edge, or its
			* retry (DESIGN.md §4.5) — and only then is the user turn queued. A request the
			* Host refused must not reach the model, or the model would summarize an item
			* the user's own write never moved. The queued turn costs a real model turn,
			* which is why the pane holds `writeBack` until the session settles; a request
			* that never reached the queue is reported instead of leaving the control
			* looking dead, which is exactly how the missing half behaved before §9.19.
			* @param item - the record to push.
			*/
			const requestWriteBack = async (item) => {
				setNotice(void 0);
				if (writeBack !== void 0) return;
				setWriteBack(item.id);
				const result = await store.requestComplete(item);
				if (result.code !== "ok") {
					setWriteBack(void 0);
					report(result);
					return;
				}
				let queued;
				try {
					queued = await queueWriteBack(props.sessionId, item);
				} catch (cause) {
					queued = {
						ok: false,
						message: cause instanceof Error ? cause.message : String(cause)
					};
				}
				if (queued.ok) return;
				setWriteBack(void 0);
				setNotice(queued.sessionMissing === true ? t("writeback.noSession") : t("writeback.failed", { message: queued.message ?? "" }));
			};
			const createItem = async (title) => {
				const trimmed = title.trim();
				if (trimmed === "") {
					setEditing({ kind: "none" });
					return;
				}
				setNotice(void 0);
				const result = await store.create(trimmed, "", "");
				if (result.code !== "ok") report(result);
				setEditing({ kind: "none" });
			};
			const toggleExpanded = (id) => {
				setExpanded((current) => current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]);
			};
			/**
			* File one item away, or bring it back (§9.31).
			*
			* No confirmation, and no `window.confirm`: archiving destroys nothing and the
			* same control reverses it, which is precisely the property the delete button
			* it replaced did not have.
			* @param item - the record to archive or restore.
			*/
			const archiveItem = async (item) => {
				setNotice(void 0);
				const result = await store.setArchived(item, !item.archived);
				if (result.code !== "ok") report(result);
			};
			if (workspaceItems.length === 0) return (0, react_jsx_runtime.jsx)("div", {
				className: WorkbenchTab_module_css_default.pane,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: WorkbenchTab_module_css_default.empty,
					children: [(0, react_jsx_runtime.jsx)("p", { children: t("workspace.none") }), (0, react_jsx_runtime.jsx)("p", {
						className: WorkbenchTab_module_css_default.emptyHint,
						children: t("workspace.noneHint")
					})]
				})
			});
			if (followed === "") return (0, react_jsx_runtime.jsx)("div", {
				className: WorkbenchTab_module_css_default.pane,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: WorkbenchTab_module_css_default.empty,
					children: [(0, react_jsx_runtime.jsx)("p", { children: t("workspace.unassigned") }), (0, react_jsx_runtime.jsx)("p", {
						className: WorkbenchTab_module_css_default.emptyHint,
						children: t("workspace.unassignedHint")
					})]
				})
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: WorkbenchTab_module_css_default.pane,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: WorkbenchTab_module_css_default.toolbar,
					children: [(0, react_jsx_runtime.jsx)("div", {
						className: WorkbenchTab_module_css_default.searchRow,
						children: (0, react_jsx_runtime.jsxs)("label", {
							className: WorkbenchTab_module_css_default.searchField,
							children: [(0, react_jsx_runtime.jsx)(SearchGlyph, {}), (0, react_jsx_runtime.jsx)("input", {
								className: WorkbenchTab_module_css_default.searchInput,
								type: "search",
								value: snapshot.query,
								placeholder: t("search.placeholder"),
								onChange: (event) => {
									store.setQuery(event.target.value);
								}
							})]
						})
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: WorkbenchTab_module_css_default.filterRow,
						children: [
							[
								"all",
								"active",
								"done",
								"archived"
							].map((tier) => (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: [WorkbenchTab_module_css_default.chip, tier === snapshot.filter && WorkbenchTab_module_css_default.chipActive].filter(Boolean).join(" "),
								"aria-pressed": tier === snapshot.filter,
								onClick: () => {
									setEditing({ kind: "none" });
									store.setFilter(tier);
								},
								children: [t(`filter.${tier}`), (0, react_jsx_runtime.jsx)("span", {
									className: WorkbenchTab_module_css_default.chipCount,
									children: snapshot.counts[tier]
								})]
							}, tier)),
							(0, react_jsx_runtime.jsx)("span", { className: WorkbenchTab_module_css_default.filterSpacer }),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: WorkbenchTab_module_css_default.iconBtn,
								title: t("action.create"),
								"aria-label": t("action.create"),
								onClick: () => {
									setEditing({ kind: "create" });
								},
								children: (0, react_jsx_runtime.jsx)(PlusGlyph, {})
							})
						]
					})]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: WorkbenchTab_module_css_default.scroller,
					children: [
						notice !== void 0 && (0, react_jsx_runtime.jsx)("p", {
							className: WorkbenchTab_module_css_default.notice,
							children: notice
						}),
						snapshot.phase === "loading" && (0, react_jsx_runtime.jsxs)("div", {
							className: WorkbenchTab_module_css_default.skeletonList,
							children: [(0, react_jsx_runtime.jsx)("div", { className: WorkbenchTab_module_css_default.skeleton }), (0, react_jsx_runtime.jsx)("div", { className: WorkbenchTab_module_css_default.skeleton })]
						}),
						snapshot.phase === "error" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("p", {
							className: `${WorkbenchTab_module_css_default.status} ${WorkbenchTab_module_css_default.statusError}`,
							children: t("state.error", { message: snapshot.error?.message ?? "" })
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: WorkbenchTab_module_css_default.retryBtn,
							onClick: () => {
								store.refresh();
							},
							children: t("state.retry")
						})] }),
						snapshot.phase === "ready" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							editing.kind === "create" && (0, react_jsx_runtime.jsx)("ul", {
								className: WorkbenchTab_module_css_default.list,
								children: (0, react_jsx_runtime.jsx)("li", {
									className: `${WorkbenchTab_module_css_default.card} ${WorkbenchTab_module_css_default.cardComposing}`,
									children: (0, react_jsx_runtime.jsxs)("div", {
										className: WorkbenchTab_module_css_default.cardHead,
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: `${WorkbenchTab_module_css_default.mark} ${WorkbenchTab_module_css_default.markBusy}`,
											children: (0, react_jsx_runtime.jsx)("span", { className: WorkbenchTab_module_css_default.markDot })
										}), (0, react_jsx_runtime.jsx)("div", {
											className: WorkbenchTab_module_css_default.cardBody,
											children: (0, react_jsx_runtime.jsx)(Composer, {
												t,
												onCommit: (title) => {
													createItem(title);
												},
												onCancel: () => {
													setEditing({ kind: "none" });
												}
											})
										})]
									})
								})
							}),
							snapshot.items.length === 0 && editing.kind !== "create" && (0, react_jsx_runtime.jsxs)("div", {
								className: WorkbenchTab_module_css_default.empty,
								children: [(0, react_jsx_runtime.jsx)("img", {
									className: WorkbenchTab_module_css_default.emptyArt,
									src: "data:image/webp;base64,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",
									alt: "",
									"aria-hidden": "true",
									width: 600,
									height: 499,
									draggable: false
								}), (0, react_jsx_runtime.jsx)("p", { children: snapshot.query !== "" || snapshot.filter !== "all" ? t("empty.filtered") : t("empty.hint") })]
							}),
							snapshot.filter === "all" && active.length > 0 && done.length > 0 && (0, react_jsx_runtime.jsxs)("p", {
								className: WorkbenchTab_module_css_default.groupLabel,
								children: [
									t("group.active"),
									" · ",
									active.length
								]
							}),
							(0, react_jsx_runtime.jsx)("ul", {
								className: WorkbenchTab_module_css_default.list,
								children: (snapshot.filter === "all" ? active : snapshot.filter === "done" ? done : snapshot.items).map((item) => (0, react_jsx_runtime.jsx)(Card, {
									item,
									t,
									editing,
									open: expanded.includes(item.id),
									pending: writeBack === item.id,
									onEdit: (next) => {
										setEditing(next);
										setNotice(void 0);
									},
									onCommit: (field, draft) => {
										commit(item, field, draft);
									},
									onCancel: () => {
										setEditing({ kind: "none" });
									},
									onToggle: () => {
										toggleExpanded(item.id);
									},
									onArchive: () => {
										archiveItem(item);
									},
									onRequestComplete: () => {
										requestWriteBack(item);
									},
									onFill: canFill ? () => {
										fillComposer(item);
									} : void 0
								}, item.id))
							}),
							snapshot.filter === "all" && done.length > 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [active.length > 0 && (0, react_jsx_runtime.jsxs)("p", {
								className: WorkbenchTab_module_css_default.groupLabel,
								children: [
									t("group.done"),
									" · ",
									done.length
								]
							}), (0, react_jsx_runtime.jsx)("ul", {
								className: WorkbenchTab_module_css_default.list,
								children: done.map((item) => (0, react_jsx_runtime.jsx)(Card, {
									item,
									t,
									editing,
									open: expanded.includes(item.id),
									pending: writeBack === item.id,
									onEdit: (next) => {
										setEditing(next);
										setNotice(void 0);
									},
									onCommit: (field, draft) => {
										commit(item, field, draft);
									},
									onCancel: () => {
										setEditing({ kind: "none" });
									},
									onToggle: () => {
										toggleExpanded(item.id);
									},
									onArchive: () => {
										archiveItem(item);
									},
									onRequestComplete: () => {
										requestWriteBack(item);
									},
									onFill: canFill ? () => {
										fillComposer(item);
									} : void 0
								}, item.id))
							})] }),
							snapshot.total > snapshot.items.length && (0, react_jsx_runtime.jsx)("p", {
								className: WorkbenchTab_module_css_default.status,
								children: t("list.more", { count: snapshot.total - snapshot.items.length })
							})
						] })
					]
				})]
			});
		}
		/** One work item. */
		function Card({ item, t, editing, open, pending = false, onEdit, onCommit, onCancel, onToggle, onArchive, onRequestComplete, onFill }) {
			const isEditing = (field) => editing.kind === "field" && editing.id === item.id && editing.field === field;
			const draftOf = (field) => editing.kind === "field" && editing.id === item.id && editing.field === field ? editing.draft : "";
			const classes = [WorkbenchTab_module_css_default.card];
			if (item.status === "done") classes.push(WorkbenchTab_module_css_default.cardDone);
			if (item.archived) classes.push(WorkbenchTab_module_css_default.cardArchived);
			return (0, react_jsx_runtime.jsxs)("li", {
				className: classes.join(" "),
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: WorkbenchTab_module_css_default.cardHead,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: [
							WorkbenchTab_module_css_default.mark,
							item.status === "done" ? WorkbenchTab_module_css_default.markDone : "",
							item.status === "in_progress" ? WorkbenchTab_module_css_default.markBusy : ""
						].filter(Boolean).join(" "),
						title: t("card.statusHint"),
						children: (0, react_jsx_runtime.jsx)("span", { className: WorkbenchTab_module_css_default.markDot })
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: WorkbenchTab_module_css_default.cardBody,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: WorkbenchTab_module_css_default.titleRow,
								children: [
									isEditing("title") ? (0, react_jsx_runtime.jsx)(InlineField, {
										className: `${WorkbenchTab_module_css_default.field} ${WorkbenchTab_module_css_default.fieldTitle}`,
										value: draftOf("title"),
										placeholder: t("edit.titlePlaceholder"),
										multiline: false,
										onChange: (draft) => {
											onEdit({
												kind: "field",
												id: item.id,
												field: "title",
												draft
											});
										},
										onCommit: (draft) => {
											onCommit("title", draft);
										},
										onCancel
									}) : (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: WorkbenchTab_module_css_default.titleText,
										onClick: () => {
											onEdit({
												kind: "field",
												id: item.id,
												field: "title",
												draft: item.title
											});
										},
										children: item.title
									}),
									item.status !== "open" && (0, react_jsx_runtime.jsxs)("span", {
										className: item.status === "done" ? `${WorkbenchTab_module_css_default.statusPill} ${WorkbenchTab_module_css_default.statusPillDone}` : `${WorkbenchTab_module_css_default.statusPill} ${WorkbenchTab_module_css_default.statusPillBusy}`,
										children: [item.status === "done" ? (0, react_jsx_runtime.jsx)(CheckBadgeGlyph, {}) : (0, react_jsx_runtime.jsx)("span", { className: WorkbenchTab_module_css_default.statusPip }), t(item.status === "done" ? "card.status.done" : "card.status.in_progress")]
									}),
									item.archived && (0, react_jsx_runtime.jsx)("span", {
										className: WorkbenchTab_module_css_default.archivedBadge,
										children: t("card.archived")
									})
								]
							}),
							isEditing("desc") ? (0, react_jsx_runtime.jsx)(InlineField, {
								className: `${WorkbenchTab_module_css_default.field} ${WorkbenchTab_module_css_default.fieldDesc}`,
								value: draftOf("desc"),
								placeholder: t("card.noDescription"),
								multiline: true,
								onChange: (draft) => {
									onEdit({
										kind: "field",
										id: item.id,
										field: "desc",
										draft
									});
								},
								onCommit: (draft) => {
									onCommit("desc", draft);
								},
								onCancel
							}) : (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: item.desc === "" ? `${WorkbenchTab_module_css_default.descText} ${WorkbenchTab_module_css_default.descEmpty}` : WorkbenchTab_module_css_default.descText,
								onClick: () => {
									onEdit({
										kind: "field",
										id: item.id,
										field: "desc",
										draft: item.desc
									});
								},
								children: item.desc === "" ? t("card.noDescription") : item.desc
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: WorkbenchTab_module_css_default.metaRow,
								children: [
									(0, react_jsx_runtime.jsx)(CalendarGlyph, {}),
									(0, react_jsx_runtime.jsx)("span", {
										className: WorkbenchTab_module_css_default.metaLabel,
										children: t("card.project")
									}),
									isEditing("tag") ? (0, react_jsx_runtime.jsx)(InlineField, {
										className: `${WorkbenchTab_module_css_default.field} ${WorkbenchTab_module_css_default.fieldTag}`,
										value: draftOf("tag"),
										placeholder: t("card.noTag"),
										multiline: false,
										onChange: (draft) => {
											onEdit({
												kind: "field",
												id: item.id,
												field: "tag",
												draft
											});
										},
										onCommit: (draft) => {
											onCommit("tag", draft);
										},
										onCancel
									}) : (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: item.tag === "" ? `${WorkbenchTab_module_css_default.tag} ${WorkbenchTab_module_css_default.tagEmpty}` : WorkbenchTab_module_css_default.tag,
										onClick: () => {
											onEdit({
												kind: "field",
												id: item.id,
												field: "tag",
												draft: item.tag
											});
										},
										children: item.tag === "" ? t("card.noTag") : item.tag
									}),
									(0, react_jsx_runtime.jsx)("span", { className: WorkbenchTab_module_css_default.metaSpacer }),
									(0, react_jsx_runtime.jsx)("span", {
										className: WorkbenchTab_module_css_default.time,
										children: relative(item.updateAt, t("card.justNow"))
									})
								]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: WorkbenchTab_module_css_default.cardFoot,
								children: [
									onFill !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: WorkbenchTab_module_css_default.primaryBtn,
										title: t("card.fillTitle"),
										"aria-label": t("card.fillTitle"),
										onClick: onFill,
										children: [(0, react_jsx_runtime.jsx)(SendGlyph, {}), (0, react_jsx_runtime.jsx)("span", { children: t("card.fill") })]
									}),
									item.status !== "done" && (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: pending ? `${WorkbenchTab_module_css_default.ghostBtn} ${WorkbenchTab_module_css_default.ghostBtnPending}` : item.status === "in_progress" ? `${WorkbenchTab_module_css_default.ghostBtn} ${WorkbenchTab_module_css_default.ghostBtnBusy}` : WorkbenchTab_module_css_default.ghostBtn,
										title: t(pending ? "writeback.pending" : item.status === "in_progress" ? "writeback.retry" : "writeback.request"),
										"aria-label": t(pending ? "writeback.pending" : item.status === "in_progress" ? "writeback.retry" : "writeback.request"),
										disabled: pending,
										onClick: onRequestComplete,
										children: [(0, react_jsx_runtime.jsx)(SummaryGlyph, {}), (0, react_jsx_runtime.jsx)("span", { children: t("card.summarize") })]
									}),
									(0, react_jsx_runtime.jsx)("span", { className: WorkbenchTab_module_css_default.footSpacer }),
									(0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: item.archived ? `${WorkbenchTab_module_css_default.archiveBtn} ${WorkbenchTab_module_css_default.archiveBtnOn}` : WorkbenchTab_module_css_default.archiveBtn,
										title: t(item.archived ? "card.unarchive" : "card.archive"),
										"aria-label": t(item.archived ? "card.unarchive" : "card.archive"),
										onClick: onArchive,
										children: [(0, react_jsx_runtime.jsx)(ArchiveGlyph, {}), (0, react_jsx_runtime.jsx)("span", { children: t(item.archived ? "card.unarchive" : "card.archive") })]
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: WorkbenchTab_module_css_default.cardActions,
										children: (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: open ? `${WorkbenchTab_module_css_default.chevron} ${WorkbenchTab_module_css_default.chevronOpen}` : WorkbenchTab_module_css_default.chevron,
											title: open ? t("card.collapse") : t("card.expand"),
											"aria-label": open ? t("card.collapseDetails") : t("card.expandDetails"),
											"aria-expanded": open,
											onClick: onToggle,
											children: [(0, react_jsx_runtime.jsx)(ChevronGlyph, {}), (0, react_jsx_runtime.jsx)("span", { children: open ? t("card.collapseDetails") : t("card.expandDetails") })]
										})
									})
								]
							})
						]
					})]
				}), (0, react_jsx_runtime.jsx)("div", {
					className: open ? `${WorkbenchTab_module_css_default.detailWrap} ${WorkbenchTab_module_css_default.detailOpen}` : WorkbenchTab_module_css_default.detailWrap,
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: WorkbenchTab_module_css_default.detail,
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: WorkbenchTab_module_css_default.completionDivider,
								children: t("completion.title")
							}),
							item.completion === void 0 ? (0, react_jsx_runtime.jsx)(CompletionEmpty, { t }) : (0, react_jsx_runtime.jsx)(Completion, {
								item,
								t
							}),
							(pending || item.status === "in_progress") && (0, react_jsx_runtime.jsx)("p", {
								className: WorkbenchTab_module_css_default.detailHint,
								children: t(pending ? "writeback.pending" : "writeback.hintRunning")
							})
						]
					})
				})]
			});
		}
		/**
		* The expanded area with nothing written back yet (§9.31).
		*
		* One icon, no sentence: the divider above it already says 待办总结, so a line of
		* copy underneath only restates the heading and the rule. The words survive as
		* the icon's accessible name, which is where they still earn their keep.
		*/
		function CompletionEmpty({ t }) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: WorkbenchTab_module_css_default.detailEmpty,
				role: "img",
				"aria-label": t("detail.noCompletion"),
				children: (0, react_jsx_runtime.jsxs)("svg", {
					width: "24",
					height: "24",
					viewBox: "0 0 24 24",
					fill: "none",
					"aria-hidden": "true",
					children: [(0, react_jsx_runtime.jsx)("rect", {
						x: "3",
						y: "4.5",
						width: "18",
						height: "15",
						rx: "4",
						stroke: "currentColor",
						strokeWidth: "1.3"
					}), (0, react_jsx_runtime.jsx)("path", {
						d: "M3 9.5h18M7.5 14h7",
						stroke: "currentColor",
						strokeWidth: "1.3",
						strokeLinecap: "round"
					})]
				})
			});
		}
		/** The structured write-back summary, once one exists. */
		function Completion({ item, t }) {
			const completion = item.completion;
			if (completion === void 0) return null;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsx)("p", {
					className: WorkbenchTab_module_css_default.completionSummary,
					children: completion.summary
				}),
				(0, react_jsx_runtime.jsxs)("div", {
					className: WorkbenchTab_module_css_default.completionBlock,
					children: [(0, react_jsx_runtime.jsx)("p", {
						className: WorkbenchTab_module_css_default.completionBlockTitle,
						children: t("completion.implementationPath")
					}), (0, react_jsx_runtime.jsx)("ol", {
						className: WorkbenchTab_module_css_default.completionSteps,
						children: completion.implementationPath.map((step, index) => (0, react_jsx_runtime.jsx)("li", { children: step }, `${String(index)}:${step}`))
					})]
				}),
				completion.changedFiles.length > 0 && (0, react_jsx_runtime.jsxs)("div", {
					className: WorkbenchTab_module_css_default.completionBlock,
					children: [(0, react_jsx_runtime.jsx)("p", {
						className: WorkbenchTab_module_css_default.completionBlockTitle,
						children: t("completion.changedFiles")
					}), (0, react_jsx_runtime.jsx)("ul", {
						className: WorkbenchTab_module_css_default.completionList,
						children: completion.changedFiles.map((file) => (0, react_jsx_runtime.jsxs)("li", {
							className: WorkbenchTab_module_css_default.completionRow,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: WorkbenchTab_module_css_default.filePath,
								children: file.path
							}), (0, react_jsx_runtime.jsx)("span", {
								className: WorkbenchTab_module_css_default.filePurpose,
								children: file.purpose
							})]
						}, file.path))
					})]
				}),
				completion.verification.length > 0 && (0, react_jsx_runtime.jsxs)("div", {
					className: WorkbenchTab_module_css_default.completionBlock,
					children: [(0, react_jsx_runtime.jsx)("p", {
						className: WorkbenchTab_module_css_default.completionBlockTitle,
						children: t("completion.verification")
					}), (0, react_jsx_runtime.jsx)("ul", {
						className: WorkbenchTab_module_css_default.completionList,
						children: completion.verification.map((entry) => (0, react_jsx_runtime.jsxs)("li", {
							className: WorkbenchTab_module_css_default.completionRow,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: WorkbenchTab_module_css_default.verifyCmd,
									children: entry.command
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: `${WorkbenchTab_module_css_default.verifyResult} ${entry.result === "passed" ? WorkbenchTab_module_css_default.verifyPassed : entry.result === "failed" ? WorkbenchTab_module_css_default.verifyFailed : WorkbenchTab_module_css_default.verifySkipped}`,
									children: t(`verify.${entry.result}`)
								}),
								entry.note !== void 0 && entry.note !== "" && (0, react_jsx_runtime.jsx)("span", {
									className: WorkbenchTab_module_css_default.filePurpose,
									children: entry.note
								})
							]
						}, entry.command))
					})]
				}),
				completion.completedBy !== "model" && (0, react_jsx_runtime.jsx)("p", {
					className: WorkbenchTab_module_css_default.completionBy,
					children: t("completion.by", { who: t(`writer.${completion.completedBy}`) })
				})
			] });
		}
		/**
		* A field that is always in edit state: it autofocuses, commits on blur, and
		* reverts on Escape.
		*
		* Blur commits rather than reverts because clicking a different field is the
		* ordinary way to finish with this one; making that lose the edit would punish
		* the common gesture. Escape is the deliberate undo.
		*
		* The box belongs to the caller's field class, which restates the metrics of the
		* text it replaces — clicking a title, a description or a tag must not move
		* anything (§9.14). The description is the one field whose box is
		* content-dependent, so it is measured here: the display clamps it to two lines,
		* and the field grows to those two lines and scrolls inside them, which keeps the
		* card exactly as tall before, during and after the edit.
		*
		* The placeholder is the caller's too, and for a description or a tag it is the
		* display state's own empty word (`card.noDescription` / `card.noTag`): an empty
		* field whose placeholder differed from what it replaced would trade a height
		* jump for a text jump.
		*/
		const DESC_LINE_HEIGHT = 19;
		function InlineField({ className, value, placeholder, multiline, onChange, onCommit, onCancel }) {
			const ref = (0, react.useRef)(null);
			const done = (0, react.useRef)(false);
			(0, react.useEffect)(() => {
				const node = ref.current;
				if (node === null) return;
				node.focus();
				node.setSelectionRange(node.value.length, node.value.length);
			}, []);
			/**
			* `rows={1}` in the render below is load-bearing here: `scrollHeight` never
			* reports less than the element's own height, so the browser's default two rows
			* would pin a one-line description at two lines and the field would jump on
			* every click. Measuring before paint keeps that from being visible.
			*/
			(0, react.useLayoutEffect)(() => {
				const node = ref.current;
				if (node === null || !multiline) return;
				const cap = 38;
				node.style.height = "auto";
				node.style.height = `${Math.max(DESC_LINE_HEIGHT, Math.min(cap, node.scrollHeight))}px`;
			}, [multiline, value]);
			const finish = (commit) => {
				if (done.current) return;
				done.current = true;
				if (commit) onCommit(value);
				else onCancel();
			};
			const shared = {
				className,
				value,
				placeholder,
				ref,
				onChange: (event) => {
					onChange(event.target.value);
				},
				onBlur: () => {
					finish(true);
				},
				onKeyDown: (event) => {
					if (event.key === "Escape") {
						event.preventDefault();
						finish(false);
						return;
					}
					if (event.key === "Enter" && (!multiline || event.shiftKey)) {
						event.preventDefault();
						finish(true);
					}
				}
			};
			return multiline ? (0, react_jsx_runtime.jsx)("textarea", {
				...shared,
				rows: 1
			}) : (0, react_jsx_runtime.jsx)("input", {
				...shared,
				type: "text"
			});
		}
		/** The new-item card: one field, because Enter means "commit this field" here too. */
		function Composer({ t, onCommit, onCancel }) {
			const [title, setTitle] = (0, react.useState)("");
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(InlineField, {
				className: `${WorkbenchTab_module_css_default.field} ${WorkbenchTab_module_css_default.fieldTitle}`,
				value: title,
				placeholder: t("edit.titlePlaceholder"),
				multiline: false,
				onChange: setTitle,
				onCommit,
				onCancel
			}), (0, react_jsx_runtime.jsx)("p", {
				className: WorkbenchTab_module_css_default.editHint,
				children: t("edit.hint")
			})] });
		}
		/** Render the workbench tab's chip title: a checklist glyph before the label. */
		function WorkbenchTabTitle(props) {
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(ChecklistGlyph, { className: WorkbenchTab_module_css_default.titleIcon }), props.t("tab.title")] });
		}
		function ChecklistGlyph({ className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				className,
				width: "14",
				height: "14",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: [
					(0, react_jsx_runtime.jsx)("rect", {
						x: "2",
						y: "2.5",
						width: "4",
						height: "4",
						rx: "1",
						stroke: "currentColor",
						strokeWidth: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("rect", {
						x: "2",
						y: "9.5",
						width: "4",
						height: "4",
						rx: "1",
						stroke: "currentColor",
						strokeWidth: "1.2"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M8.5 4.5h5.5M8.5 11.5h5.5",
						stroke: "currentColor",
						strokeWidth: "1.4",
						strokeLinecap: "round"
					})
				]
			});
		}
		function SearchGlyph() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "13",
				height: "13",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: [(0, react_jsx_runtime.jsx)("circle", {
					cx: "7",
					cy: "7",
					r: "4.5",
					stroke: "currentColor",
					strokeWidth: "1.4"
				}), (0, react_jsx_runtime.jsx)("path", {
					d: "M10.5 10.5 14 14",
					stroke: "currentColor",
					strokeWidth: "1.4",
					strokeLinecap: "round"
				})]
			});
		}
		function PlusGlyph() {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: "14",
				height: "14",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", {
					d: "M8 3.2v9.6M3.2 8h9.6",
					stroke: "currentColor",
					strokeWidth: "1.5",
					strokeLinecap: "round"
				})
			});
		}
		/**
		* The disclosure chevron.
		*
		* It points down, because the control it sits on says "展开详情": the direction
		* is the promise the label makes, and a right-pointing chevron would read as
		* "next" instead. The open state rotates the *glyph* 180° — never the button,
		* whose rounded hover and press surface must not spin (§9.18).
		*/
		function ChevronGlyph() {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: "13",
				height: "13",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", {
					d: "m3.6 6.2 4.4 4.4 4.4-4.4",
					stroke: "currentColor",
					strokeWidth: "1.5",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		/**
		* The project line's calendar, and the card's date fact.
		*
		* Drawn in the hand-cut 16 box the rest of these glyphs use, at the weight of
		* `.metaLabel` beside it, so the meta line reads as one sentence rather than as
		* an icon with a caption bolted on.
		*/
		function CalendarGlyph() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "15",
				height: "15",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: [(0, react_jsx_runtime.jsx)("rect", {
					x: "2.3",
					y: "3.6",
					width: "11.4",
					height: "10",
					rx: "2.6",
					stroke: "currentColor",
					strokeWidth: "1.4"
				}), (0, react_jsx_runtime.jsx)("path", {
					d: "M2.3 6.9h11.4M5.8 2.4v2.3M10.2 2.4v2.3",
					stroke: "currentColor",
					strokeWidth: "1.4",
					strokeLinecap: "round"
				})]
			});
		}
		/**
		* The finished pill's badge: a filled disc with a knocked-out check.
		*
		* The disc is the pill's own ink, so the two are one colour; the check is
		* knocked out in the surface colour (`--wb-on-accent`), which is what keeps it
		* legible in either theme without a second palette.
		*/
		function CheckBadgeGlyph() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "12",
				height: "12",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: [(0, react_jsx_runtime.jsx)("circle", {
					cx: "8",
					cy: "8",
					r: "6.9",
					fill: "currentColor"
				}), (0, react_jsx_runtime.jsx)("path", {
					d: "m5 8.2 2 2 4-4.2",
					stroke: "var(--wb-on-accent)",
					strokeWidth: "1.7",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})]
			});
		}
		/**
		* Send: the icon set's paper plane.
		*
		* Its nose points up-right, the opposite of the hand-drawn plane this replaced:
		* that one flew left because this pane sits on the right of the window and the
		* item travels towards the conversation. That reading (§9.11 item 3) is the one
		* thing this swap gives up, and §9.15 records it as a deliberate trade — the
		* direction belongs to the artwork the user picked. Mirroring it back is a
		* `scaleX(-1)` on this `<svg>` whenever it is wanted.
		*/
		function SendGlyph() {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: "14",
				height: "14",
				viewBox: "0 0 1024 1024",
				fill: "currentColor",
				"aria-hidden": "true",
				children: (0, react_jsx_runtime.jsx)("path", { d: "M826.709333 142.336a32 32 0 0 1 46.72 32.128l-78.293333 656.981333a32 32 0 0 1-44.672 25.472l-202.069333-89.130666-106.965334 108.074666a32 32 0 0 1-54.442666-18.133333L386.688 853.333333v-158.805333l-250.453333-131.669333a32 32 0 0 1-4.053334-54.144l4.010667-2.474667z m-28.629333 123.434667l-342.186667 429.397333a32.085333 32.085333 0 0 1-5.12 5.12l-0.085333 75.221333 67.712-68.394666a32 32 0 0 1 31.018667-8.405334l4.650666 1.664 182.613334 80.512 61.397333-515.114666z m-91.562667 12.202666L219.818667 534.485333l198.912 104.618667 287.786666-361.130667z" })
			});
		}
		/**
		* Write-back: a summary sheet with two lines of text on it.
		*
		* §9.13 chose a reading mark (the magnifier with a trend line) while the control
		* was a 24px icon in the heading line, where only its silhouette could speak.
		* Now the control carries the word 总结, so the glyph's job is to name the thing
		* produced — a written summary — in the same line weight as the calendar and the
		* chevron it stands beside.
		*/
		function SummaryGlyph() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "13",
				height: "13",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: [(0, react_jsx_runtime.jsx)("rect", {
					x: "3.1",
					y: "2.2",
					width: "9.8",
					height: "11.6",
					rx: "2.3",
					stroke: "currentColor",
					strokeWidth: "1.4"
				}), (0, react_jsx_runtime.jsx)("path", {
					d: "M5.8 6.1h4.4M5.8 9.7h2.9",
					stroke: "currentColor",
					strokeWidth: "1.4",
					strokeLinecap: "round"
				})]
			});
		}
		/**
		* Archive: a box with its lid laid flat and an arrow dropping into it (§9.31).
		*
		* Drawn at the same 13px/stroke-1.4 weight as the row's other glyphs, so the
		* control that replaced delete does not read as a different kind of thing.
		*/
		function ArchiveGlyph() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "13",
				height: "13",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: [
					(0, react_jsx_runtime.jsx)("rect", {
						x: "2.4",
						y: "3",
						width: "11.2",
						height: "3.1",
						rx: "1",
						stroke: "currentColor",
						strokeWidth: "1.3",
						strokeLinejoin: "round"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M3.5 6.1v5.4a1.4 1.4 0 0 0 1.4 1.4h6.2a1.4 1.4 0 0 0 1.4-1.4V6.1",
						stroke: "currentColor",
						strokeWidth: "1.3",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M8 8.2v3.4M6.5 10.1L8 11.6l1.5-1.5",
						stroke: "currentColor",
						strokeWidth: "1.3",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					})
				]
			});
		}
		//#endregion
		//#region packages/workbench/lib/types/client/definition.js
		/** Registration identity, and the key the body and title register under. */
		const WORKBENCH_TAB_ID = "dsh-plugin-workbench/workbench";
		/** Type discriminator: what a workbench tab is, and what `openTab` names. */
		const WORKBENCH_KIND = "workbench";
		/**
		* Registration identity for the tab-menu seat.
		*
		* The seat is a `list`, so its entries need a stable id to be identified and
		* ordered. One registration renders both of this plugin's entries, so one id
		* covers them.
		*/
		const WORKBENCH_MENU_ID = "dsh-plugin-workbench/menu";
		/**
		* Build the tab type definition.
		*
		* `multiple: false` gives one workbench page per pane: the list is a view onto
		* a workspace, and a second copy of it in the same pane is never what anyone
		* wanted. `keepMounted` preserves scroll position and filter choice across tab
		* switches, which a work list is expected to do.
		*
		* No `guide` entries, deliberately. Two things follow from offering none: the
		* workbench stops being advertised as a capsule on 开始, and the guide resumes
		* being that page's seeded default — the seed is the sole registered entry, or
		* the guide when there are none — so opening the sidebar lands on 开始 and
		* `guard.ts` then puts the workbench beside it. Adding an entry back would
		* undo both.
		* @param t - This plugin's translator.
		* @returns the definition to register.
		*/
		function workbenchTabDefinition(t) {
			return {
				id: WORKBENCH_TAB_ID,
				kind: WORKBENCH_KIND,
				priority: "extension",
				multiple: false,
				keepMounted: true,
				title: () => t("tab.title")
			};
		}
		//#endregion
		//#region packages/workbench/lib/types/client/store.js
		/** How long a keystroke waits before it becomes a query. */
		const QUERY_DEBOUNCE_MS = 250;
		/** An empty snapshot for a workspace nothing has loaded yet. */
		function blank(workspaceId) {
			return {
				workspaceId,
				query: "",
				filter: "all",
				phase: "idle",
				items: [],
				total: 0,
				counts: {
					all: 0,
					active: 0,
					done: 0,
					archived: 0
				},
				error: null
			};
		}
		/** Which tier total a record contributes to; mirrors the Host's `search` tally. */
		function tierOf(item) {
			if (item.archived) return "archived";
			return item.status === "done" ? "done" : "active";
		}
		/**
		* Move one record's contribution into or out of the tier totals.
		*
		* Local writes are merged into the snapshot rather than re-queried (refresh
		* tier 1), so the counts have to move with them or the filter row would keep
		* advertising the totals it had before the write.
		* @param counts - totals before the change.
		* @param item - the record being added or removed.
		* @param delta - `1` when the record appears, `-1` when it goes away.
		* @returns the adjusted totals.
		*/
		function tally(counts, item, delta) {
			const tier = tierOf(item);
			const moved = (value) => Math.max(0, value + delta);
			return {
				all: tier === "archived" ? counts.all : moved(counts.all),
				active: tier === "active" ? moved(counts.active) : counts.active,
				done: tier === "done" ? moved(counts.done) : counts.done,
				archived: tier === "archived" ? moved(counts.archived) : counts.archived
			};
		}
		/** Translate a filter tier into the Host's filter fields. */
		function filterToRequest(filter) {
			switch (filter) {
				case "active": return {
					status: ["open", "in_progress"],
					archived: "exclude"
				};
				case "done": return {
					status: ["done"],
					archived: "exclude"
				};
				case "archived": return { archived: "only" };
				case "all": return { archived: "exclude" };
			}
		}
		/**
		* Whether a record belongs in a tier, by the same rule `filterToRequest` sends
		* to the Host.
		*
		* Needed locally because an archive write can answer "does this still belong in
		* the list I am looking at?" — and for the daily tiers the answer is no, which
		* is a removal rather than a merge.
		* @param item - the record as the Host returned it.
		* @param filter - the tier on screen.
		* @returns whether the record is still part of that tier.
		*/
		function matchesFilter(item, filter) {
			switch (filter) {
				case "active": return !item.archived && item.status !== "done";
				case "done": return !item.archived && item.status === "done";
				case "archived": return item.archived;
				case "all": return !item.archived;
			}
		}
		/** Replace one record in a list, leaving the list untouched when it holds none. */ function replace(items, next) {
			const at = items.findIndex((item) => item.id === next.id);
			if (at < 0) return items;
			const copy = items.slice();
			copy[at] = next;
			return copy;
		}
		/**
		* Snapshot store for the workbench pane.
		*
		* One snapshot per workspace, kept in a map, so returning to a workspace shows
		* the list it had rather than an empty one while the query is in flight
		* (DESIGN.md §5.5).
		*/
		var WorkbenchStore = class {
			gateway;
			cache = /* @__PURE__ */ new Map();
			listeners = /* @__PURE__ */ new Set();
			activeId = "";
			queryTimer;
			/**
			* Bumped on every load; a response whose generation is stale is dropped.
			*
			* Without this, switching workspace quickly can let a slow answer for the
			* previous workspace overwrite the new one — the classic out-of-order load.
			*/
			generation = 0;
			/** @param gateway - the Remote calls this store drives. */
			constructor(gateway) {
				this.gateway = gateway;
			}
			/**
			* @returns the active workspace's snapshot; never undefined.
			*
			* The fallback must NOT build an uncached `blank(...)` per call: React's
			* `useSyncExternalStore` compares the value it saw at the last render with the
			* value it reads at the next commit, and a fresh object every read is a
			* "store changed" in its eyes even when nothing published — the pane then
			* re-renders itself forever and dies as React #185 (§9.24). Seeding the empty
			* snapshot into the cache gives every `activeId` one stable identity, and the
			* later `setWorkspace`'s merge (`patch`) reads and rewrites that same entry.
			*/
			getSnapshot = () => {
				const cached = this.cache.get(this.activeId);
				if (cached !== void 0) return cached;
				const seeded = blank(this.activeId);
				this.cache.set(this.activeId, seeded);
				return seeded;
			};
			/** @param listener - called on any change to the active snapshot. @returns unsubscribe. */
			subscribe = (listener) => {
				this.listeners.add(listener);
				return () => {
					this.listeners.delete(listener);
				};
			};
			/** The workspace every call is currently scoped to. */
			get workspaceId() {
				return this.activeId;
			}
			/** Stop the pending query timer. */
			dispose() {
				if (this.queryTimer !== void 0) clearTimeout(this.queryTimer);
				this.listeners.clear();
			}
			/**
			* Point the pane at a workspace, loading it when its snapshot is not ready.
			* @param workspaceId - workspace to show; `''` clears the pane.
			*/
			setWorkspace(workspaceId) {
				if (workspaceId === this.activeId) return;
				this.activeId = workspaceId;
				this.publish();
				const cached = this.cache.get(workspaceId);
				if (cached !== void 0 && cached.phase === "ready") this.load();
				else if (workspaceId !== "") this.load();
			}
			/**
			* Set the query text and schedule a reload.
			* @param query - raw search text.
			*/
			setQuery(query) {
				if (this.getSnapshot().query === query) return;
				this.patch({ query });
				if (this.queryTimer !== void 0) clearTimeout(this.queryTimer);
				this.queryTimer = setTimeout(() => {
					this.queryTimer = void 0;
					this.load();
				}, QUERY_DEBOUNCE_MS);
			}
			/**
			* Switch filter tier and reload at once: a click is deliberate, unlike a
			* keystroke, so it should not wait.
			* @param filter - tier to show.
			*/
			setFilter(filter) {
				if (this.getSnapshot().filter === filter) return;
				this.patch({ filter });
				this.load();
			}
			/** Reload the active workspace, keeping the current list on screen meanwhile. */
			async refresh() {
				await this.load();
			}
			/**
			* Create an item in the active workspace and show it without a re-query.
			* @param title - non-blank title; the Host trims and rejects a blank one.
			* @param desc - initial description.
			* @param tag - initial tag.
			* @returns the Host's result union, for the caller to report.
			*/
			async create(title, desc, tag) {
				const result = await this.gateway.create({
					workspaceId: this.activeId,
					title,
					desc,
					tag
				});
				if (result.code === "ok") this.admit(result.item);
				return result;
			}
			/**
			* Replace an item's description.
			* @param item - the item being edited; its `updateAt` is the compare-and-swap token.
			* @param desc - new description.
			* @returns the Host's result union.
			*/
			async setDesc(item, desc) {
				if (desc === item.desc) return {
					code: "ok",
					item
				};
				const result = await this.gateway.setDesc({
					id: item.id,
					workspaceId: this.activeId,
					desc,
					expectedUpdateAt: item.updateAt
				});
				await this.settle(result);
				return result;
			}
			/**
			* Replace an item's title and/or tag.
			* @param item - the item being edited; its `updateAt` is the compare-and-swap token.
			* @param next - the fields to change.
			* @returns the Host's result union.
			*/
			async update(item, next) {
				if (next.title === item.title && next.tag === item.tag) return {
					code: "ok",
					item
				};
				const result = await this.gateway.update({
					id: item.id,
					workspaceId: this.activeId,
					expectedUpdateAt: item.updateAt,
					...next.title === void 0 ? {} : { title: next.title },
					...next.tag === void 0 ? {} : { tag: next.tag }
				});
				await this.settle(result);
				return result;
			}
			/**
			* Ask the Host to write this item back: the `open → in_progress` edge, or its
			* retry (DESIGN.md §4.5).
			*
			* No summary is written here and none is faked. On the retry edge the Host
			* returns the record untouched, so a second press neither conflicts with the
			* first nor refreshes the item's clock — which is why nothing in this call has
			* to special-case a repeat.
			* @param item - the item to push; its `updateAt` is the compare-and-swap token.
			* @returns the Host's result union.
			*/
			async requestComplete(item) {
				const result = await this.gateway.requestComplete({
					id: item.id,
					workspaceId: this.activeId,
					expectedUpdateAt: item.updateAt
				});
				await this.settle(result);
				return result;
			}
			/**
			* File an item away, or bring it back (DESIGN.md §4.7, §9.31).
			*
			* The one write that can move a record between tiers, so it is not merged the
			* way a field edit is: an archived item leaves 全部/未完成/已完成 and turns up
			* under 已归档, and the totals have to move with it — or the filter row would go
			* on advertising the sizes it had before the click. The item is dropped from
			* the list outright when the active filter stops matching it.
			* @param item - the item whose archived state changes.
			* @param archived - `true` to file it away, `false` to bring it back.
			* @returns the Host's result union.
			*/
			async setArchived(item, archived) {
				if (item.archived === archived) return {
					code: "ok",
					item
				};
				const result = await this.gateway.archive({
					id: item.id,
					workspaceId: this.activeId,
					archived,
					expectedUpdateAt: item.updateAt
				});
				if (result.code !== "ok") return result;
				if (this.getSnapshot().query !== "") {
					await this.load();
					return result;
				}
				const current = this.getSnapshot();
				const visible = current.items.some((existing) => existing.id === item.id);
				const counts = tally(tally(current.counts, item, -1), result.item, 1);
				const shown = matchesFilter(result.item, current.filter);
				this.patch({
					items: shown ? [result.item, ...current.items.filter((existing) => existing.id !== item.id)] : current.items.filter((existing) => existing.id !== item.id),
					total: Math.max(0, current.total + (shown === visible ? 0 : shown ? 1 : -1)),
					counts
				});
				return result;
			}
			/**
			* Delete an item for good. Archiving is a different thing (DESIGN.md §4.7).
			* @param id - item to remove.
			* @returns the Host's result union.
			*/
			async remove(id) {
				const result = await this.gateway.delete({
					id,
					workspaceId: this.activeId
				});
				if (result.code === "ok") {
					const current = this.getSnapshot();
					const gone = current.items.find((item) => item.id === id);
					this.patch({
						items: current.items.filter((item) => item.id !== id),
						total: Math.max(0, current.total - 1),
						counts: gone === void 0 ? current.counts : tally(current.counts, gone, -1)
					});
				}
				return result;
			}
			/**
			* Apply a write result to the snapshot.
			*
			* With no query in force the returned record is merged directly. With one, the
			* write may have changed whether the item still matches, and only the Host can
			* say, so a refresh runs instead.
			* @param result - the write's result union.
			*/
			async settle(result) {
				if (result.code !== "ok") return;
				if (this.getSnapshot().query !== "") {
					await this.load();
					return;
				}
				this.admit(result.item);
			}
			/** Merge a created or changed record into the active list, in place. */
			admit(item) {
				const current = this.getSnapshot();
				const known = current.items.some((existing) => existing.id === item.id);
				this.patch({
					items: known ? replace(current.items, item) : [item, ...current.items],
					total: known ? current.total : current.total + 1,
					counts: known ? current.counts : tally(current.counts, item, 1)
				});
			}
			/**
			* Install the Host's version of a record after a conflict.
			*
			* The user's edit lost, but the pane must not keep showing the stale copy it
			* was editing — otherwise the next attempt fails the same way. The Host
			* returns the winning record precisely so this can happen.
			* @param item - the record the Host reports as current.
			*/
			adoptConflict(item) {
				const current = this.getSnapshot();
				const previous = current.items.find((existing) => existing.id === item.id);
				if (previous === void 0) return;
				this.patch({
					items: replace(current.items, item),
					counts: tally(tally(current.counts, previous, -1), item, 1)
				});
			}
			/** Read the active workspace from the Host. */
			async load() {
				const workspaceId = this.activeId;
				if (workspaceId === "") return;
				const generation = ++this.generation;
				const current = this.getSnapshot();
				this.patch({ phase: current.phase === "ready" ? "ready" : "loading" });
				try {
					const value = await this.gateway.search({
						workspaceId,
						query: current.query,
						...filterToRequest(current.filter)
					});
					if (generation !== this.generation) return;
					this.patch({
						phase: "ready",
						items: value.items,
						total: value.total,
						counts: value.counts,
						error: null
					});
				} catch (error) {
					if (generation !== this.generation) return;
					this.patch({
						phase: "error",
						error: describe(error)
					});
				}
			}
			/** Merge a partial change into the active snapshot and notify. */
			patch(change) {
				const next = {
					...this.getSnapshot(),
					...change
				};
				this.cache.set(this.activeId, next);
				this.publish();
			}
			/** Wake every subscriber. */
			publish() {
				for (const listener of this.listeners) listener();
			}
		};
		/** Turn a thrown value into the shape the error banner renders. */
		function describe(error) {
			if (typeof error === "object" && error !== null) {
				const candidate = error;
				const message = typeof candidate.message === "string" && candidate.message !== "" ? candidate.message : String(error);
				return {
					code: typeof candidate.code === "string" ? candidate.code : "unknown",
					message
				};
			}
			return {
				code: "unknown",
				message: String(error)
			};
		}
		/**
		* Render items as a Markdown checklist, for the tab menu's copy action.
		* @param items - records to render, in the order shown.
		* @returns a Markdown document, one bullet per item.
		*/
		function toMarkdown(items) {
			if (items.length === 0) return "";
			return `${items.map((item) => {
				const box = item.status === "done" ? "[x]" : "[ ]";
				const tag = item.tag === "" ? "" : ` \`${item.tag}\``;
				const archived = item.archived ? " _(archived)_" : "";
				const head = `- ${box} **${item.title}**${tag}${archived}`;
				if (item.desc === "") return head;
				return `${head}\n${item.desc.split("\n").map((line) => `  ${line}`).join("\n")}`;
			}).join("\n")}\n`;
		}
		//#endregion
		//#region \0dsh-css:/Users/lanto/Projects/deepseek-plugins/dsh-plugin-workbench/packages/workbench/src/client/WorkbenchMenu.module.css.mjs
		const css = ".HJHN3W_item{width:100%;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;white-space:nowrap;cursor:pointer;background:0 0;border:0;border-radius:7px;align-items:center;padding:6px 10px;font-size:12.5px;display:flex}.HJHN3W_item:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent)}";
		const tagId = "dsh-plugin-workbench/WorkbenchMenu.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-plugin-workbench";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var WorkbenchMenu_module_css_default = { "item": "HJHN3W_item" };
		//#endregion
		//#region packages/workbench/lib/types/client/WorkbenchMenu.js
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
			if (typeof tab !== "object" || tab === null) return void 0;
			const value = tab.kind;
			return typeof value === "string" ? value : void 0;
		}
		/** Render the workbench entries, or nothing when another tab's menu is open. */
		function WorkbenchMenuItem(props) {
			const { t, reportCopyFailure } = props;
			if (kindOf(props.tab) !== "workbench") return null;
			const store = props.storeFor(props.sessionId);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: WorkbenchMenu_module_css_default.item,
				onClick: () => {
					props.dismiss();
					store.refresh();
				},
				children: t("action.refresh")
			}), (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: WorkbenchMenu_module_css_default.item,
				onClick: () => {
					props.dismiss();
					const markdown = toMarkdown(store.getSnapshot().items);
					if (markdown === "") return;
					navigator.clipboard.writeText(markdown).catch((error) => {
						reportCopyFailure(error instanceof Error ? error.message : String(error));
					});
				},
				children: t("action.copy")
			})] });
		}
		//#endregion
		//#region packages/workbench/lib/types/client/guard.js
		/**
		* Hold the workbench tab open beside the guide, in every sidebar the user opens.
		*
		* WHY THIS EXISTS. A session's right Sidebar seeds exactly one page the first
		* time its column expands — the sole registered guide entry, or the guide
		* itself when nothing registered one — and the platform protects exactly one
		* tab from closing: `canCloseTab` refuses only a missing tab and the guide
		* standing as the sole docked tab. A tab type has no `closable`, `pinned`, or
		* `locked` field, and `registerCloseHandler` is a notification (it returns
		* `void`), not a veto. From a plugin, then, "this tab cannot be closed" has no
		* declarative form: the store honours the close, and this module undoes it.
		*
		* WHAT IT DOES. It subscribes to the two change signals that move when a
		* sidebar's page set moves — the tab inventory, which every session's commit
		* publishes, and the on-screen session — and opens the tab whenever the ruling
		* below says it belongs there. Opening for the first time and re-opening after
		* a close are one operation, so "the tab is there by default" and "the tab
		* comes back" are one mechanism rather than two.
		*
		* WHY IT IS NOT INTRUSIVE. Three conditions gate every reconcile:
		*
		* - No on-screen session, or a collapsed column: there is nothing to open into.
		*   Since opening a tab expands the column, this is what keeps a sidebar the
		*   user has not opened closed — and it is also what makes the tab arrive by
		*   default rather than immediately: the first expansion seeds the guide, that
		*   commit publishes, and this reconcile puts the workbench beside it.
		* - An empty pane: the seed and this open would race for the same root pane,
		*   and the workbench winning that race would cost the session its guide page
		*   for good.
		* - The kind already present: `openTabIn` is idempotent for a page kind, but
		*   re-opening on an unrelated commit would re-focus the tab and undo the
		*   user's choice of what to look at.
		*
		* Everything here is plain data and callbacks, so the ruling is unit-tested
		* without a runtime: see `tests/tab-guardian.spec.ts`.
		*/
		/**
		* Decide whether this reconcile has to open a workbench tab.
		*
		* The order of the checks is the order of their consequences: a collapsed
		* column is the "never open the sidebar for the user" rule, an empty pane is
		* the "never rob the seed" rule, and a present kind is the "never fight the
		* user over what to look at" rule.
		* @param screen - the on-screen session's sidebar, or `undefined` when no surface is mounted.
		* @param kind - the workbench tab's kind.
		* @returns an `open: false` ruling that means "leave the sidebar exactly as it is".
		*/
		function ruleWorkbenchTab(screen, kind) {
			if (screen === void 0 || !screen.expanded) return { open: false };
			if (screen.kinds.length === 0 || screen.kinds.includes(kind)) return { open: false };
			return { open: true };
		}
		/**
		* Keep the workbench tab open.
		*
		* Scheduling is deferred by one microtask because a subscription fires inside
		* the commit that moved the layout, and committing again from there would nest
		* one store write in another. The microtask lands after that commit and before
		* the frame paints, so the user sees the tab in place of the gap rather than
		* after it. A second invalidation arriving before the microtask runs is
		* coalesced into it, and the open converges rather than looping because the
		* commit it causes reports the kind as present.
		* @param sidebar - the controller face, already bound to its receiver.
		* @param kind - the workbench tab's kind.
		* @param report - sink for a failed open, so one bad reconcile cannot break the app.
		* @returns disposer stopping both subscriptions.
		*/
		function guardWorkbenchTab(sidebar, kind, report) {
			let stopped = false;
			let scheduled = false;
			const reconcile = () => {
				if (stopped || scheduled) return;
				scheduled = true;
				queueMicrotask(() => {
					scheduled = false;
					if (stopped) return;
					if (!ruleWorkbenchTab(sidebar.onScreen(), kind).open) return;
					try {
						sidebar.openOnScreen(kind);
					} catch (error) {
						report(`tab guardian could not open ${kind}: ${String(error)}`);
					}
				});
			};
			const stopTabs = sidebar.tabs.subscribe(reconcile);
			const stopMounted = sidebar.mounted.subscribe(reconcile);
			reconcile();
			return () => {
				stopped = true;
				stopTabs();
				stopMounted();
			};
		}
		//#endregion
		//#region packages/workbench/lib/types/client/changes.js
		/** How many times in a row a dead stream is reopened before the follower stops. */
		const MAX_ATTEMPTS = 8;
		/** First backoff step; doubles per failed attempt up to {@link MAX_BACKOFF_MS}. */
		const FIRST_BACKOFF_MS = 250;
		/** Ceiling on the retry delay, so a long outage does not stretch waits forever. */
		const MAX_BACKOFF_MS = 4e3;
		/** The delay before attempt number `attempt` (1-based). */
		function backoff(attempt) {
			return Math.min(MAX_BACKOFF_MS, FIRST_BACKOFF_MS * 2 ** (attempt - 1));
		}
		/**
		* Sleep, but wake immediately on abort.
		*
		* A plain `setTimeout` promise would hold the follower open for up to
		* {@link MAX_BACKOFF_MS} after the plugin was disposed, and the abort listener it
		* leaked would keep the old copy of this function alive with it.
		* @param ms - how long to wait.
		* @param signal - plugin lifetime.
		*/
		function wait(ms, signal) {
			return new Promise((resolve) => {
				const timer = setTimeout(done, ms);
				function done() {
					clearTimeout(timer);
					signal.removeEventListener("abort", done);
					resolve();
				}
				signal.addEventListener("abort", done, { once: true });
			});
		}
		/**
		* Re-read the panes a notice names, and keep doing so until the plugin is gone.
		* @param options - the stream opener, the panes, and the lifetime signal.
		* @returns why the loop ended; never rejects.
		*/
		async function followChanges(options) {
			const { signal } = options;
			const sleep = options.wait ?? wait;
			let reconnect = false;
			let attempt = 0;
			while (!signal.aborted) {
				if (reconnect) for (const target of options.targets()) target.refresh();
				reconnect = true;
				try {
					for await (const change of options.open()) {
						if (signal.aborted) return "aborted";
						attempt = 0;
						for (const target of options.targets()) if (target.workspaceId !== "" && target.workspaceId === change.workspaceId) target.refresh();
					}
				} catch (error) {
					if (signal.aborted) return "aborted";
					options.onError?.(error);
				}
				if (signal.aborted) return "aborted";
				attempt += 1;
				if (attempt > MAX_ATTEMPTS) return "gave-up";
				await sleep(backoff(attempt), signal);
			}
			return "aborted";
		}
		//#endregion
		//#region packages/workbench/lib/types/client/locales.js
		/**
		* Workbench tab, toolbar, list, and detail copy.
		*
		* Every string the pane can show lives here, including the ones only reachable
		* in a later phase: a half-localized pane is worse than a complete dictionary,
		* and `en` is typed against the Chinese key set so the two cannot drift.
		*/
		/** Namespace owned by the workbench plugin. */
		const NS = "workbench";
		/** Simplified Chinese labels and dictionary keys. */
		const zh = {
			"tab.title": "工作台",
			"search.placeholder": "搜索标题、描述、标签…",
			"filter.all": "全部",
			"filter.active": "未完成",
			"filter.done": "已完成",
			"filter.archived": "已归档",
			"action.create": "新建工作项",
			"action.delete": "删除",
			"action.deleteConfirm": "确定删除工作项「{title}」？此操作不可撤销。",
			"action.refresh": "刷新",
			"action.copy": "复制为 Markdown",
			"action.copied": "已复制到剪贴板",
			"action.copyFailed": "复制失败：{message}",
			"state.loading": "正在载入工作项…",
			"state.error": "载入失败：{message}",
			"state.retry": "重试",
			"workspace.none": "没有可用的工作区",
			"workspace.noneHint": "先在左侧栏创建一个工作区，工作项按工作区存放。",
			"workspace.unassigned": "这个对话不在任何工作区里",
			"workspace.unassignedHint": "把对话移进一个工作区，工作台就显示存放在那里的工作项。",
			"empty.hint": "点击「+」新建一条",
			"empty.filtered": "换个筛选档，或把搜索词清空。",
			"list.more": "还有 {count} 条未显示",
			"card.noDescription": "添加描述…",
			"card.noTag": "+ 标签",
			"card.project": "项目：",
			"card.status.done": "已完成",
			"card.status.in_progress": "进行中",
			"card.statusHint": "状态由写回自动更新",
			"card.archived": "已归档",
			"card.justNow": "刚刚",
			"card.expand": "展开",
			"card.collapse": "收起",
			"card.expandDetails": "展开详情",
			"card.collapseDetails": "收起详情",
			"card.fillTitle": "把这条工作项填入对话框输入框",
			"card.fill": "发送",
			"card.summarize": "总结",
			"card.archive": "归档",
			"card.unarchive": "取消归档",
			"group.active": "未完成",
			"group.done": "已完成",
			"group.archived": "已归档",
			"detail.noCompletion": "还没有待办总结",
			"writeback.request": "待办总结",
			"writeback.retry": "待办总结 · 重新写回",
			"writeback.pending": "已发送，等待模型写回…",
			"writeback.hintRunning": "进行中 · 可再次写回",
			"writeback.failed": "写回请求未能发出：{message}",
			"writeback.noSession": "当前会话不可用，请重新打开后再试",
			"completion.title": "待办总结",
			"completion.implementationPath": "实现路径",
			"completion.changedFiles": "修改文件",
			"completion.verification": "验证结果",
			"completion.by": "{who}写回",
			"writer.model": "模型",
			"writer.user": "用户",
			"verify.passed": "通过",
			"verify.failed": "失败",
			"verify.skipped": "跳过",
			"edit.hint": "回车保存 · Esc 取消",
			"edit.titlePlaceholder": "标题",
			"error.conflict": "这条工作项已在别处被修改，本地副本已过期。",
			"error.notFound": "这条工作项已经不存在了。",
			"error.invalid": "写入被拒绝：{message}"
		};
		/** English labels, checked against the Chinese key set. */
		const en = {
			"tab.title": "Workbench",
			"search.placeholder": "Search title, description, tag…",
			"filter.all": "All",
			"filter.active": "Open",
			"filter.done": "Done",
			"filter.archived": "Archived",
			"action.create": "New work item",
			"action.delete": "Delete",
			"action.deleteConfirm": "Delete the work item “{title}”? This cannot be undone.",
			"action.refresh": "Refresh",
			"action.copy": "Copy as Markdown",
			"action.copied": "Copied to clipboard",
			"action.copyFailed": "Copy failed: {message}",
			"state.loading": "Loading work items…",
			"state.error": "Could not load: {message}",
			"state.retry": "Retry",
			"workspace.none": "No workspace available",
			"workspace.noneHint": "Create a workspace in the left sidebar first; work items are stored per workspace.",
			"workspace.unassigned": "This conversation is not in a workspace",
			"workspace.unassignedHint": "Move the conversation into a workspace and the workbench shows the work items kept there.",
			"empty.hint": "Click “+” to create one",
			"empty.filtered": "Try another tier, or clear the search box.",
			"list.more": "{count} more not shown",
			"card.noDescription": "Add a description…",
			"card.noTag": "+ tag",
			"card.project": "Project:",
			"card.status.done": "Done",
			"card.status.in_progress": "In progress",
			"card.statusHint": "Status is updated by write-back",
			"card.archived": "Archived",
			"card.justNow": "just now",
			"card.expand": "Expand",
			"card.collapse": "Collapse",
			"card.expandDetails": "Details",
			"card.collapseDetails": "Hide details",
			"card.fillTitle": "Put this work item into the composer input",
			"card.fill": "Send",
			"card.summarize": "Summarize",
			"card.archive": "Archive",
			"card.unarchive": "Restore",
			"group.active": "Open",
			"group.done": "Done",
			"group.archived": "Archived",
			"detail.noCompletion": "No to-do summary yet",
			"writeback.request": "To-do summary",
			"writeback.retry": "To-do summary · write back again",
			"writeback.pending": "Sent, waiting for the model…",
			"writeback.hintRunning": "In progress · can be written back again",
			"writeback.failed": "The write-back request could not be sent: {message}",
			"writeback.noSession": "This session is not available; reopen it and try again",
			"completion.title": "To-do summary",
			"completion.implementationPath": "Implementation path",
			"completion.changedFiles": "Changed files",
			"completion.verification": "Verification",
			"completion.by": "Written back by {who}",
			"writer.model": "the model",
			"writer.user": "the user",
			"verify.passed": "passed",
			"verify.failed": "failed",
			"verify.skipped": "skipped",
			"edit.hint": "Enter to save · Esc to cancel",
			"edit.titlePlaceholder": "Title",
			"error.conflict": "This work item changed elsewhere; the local copy is stale.",
			"error.notFound": "That work item no longer exists.",
			"error.invalid": "Write rejected: {message}"
		};
		//#endregion
		//#region packages/workbench/lib/types/client/deps.js
		/**
		* The Client services this plugin declares before it reads them.
		*
		* Cordis resolves `ctx.<name>` only for a service the plugin declared: an
		* undeclared read throws `cannot get property "<name>" without inject` from the
		* context proxy, at whatever moment the read happens — for a click handler that
		* was an unhandled rejection with the control left looking dead (§9.23).
		* Declaring them here holds activation until they exist, makes the reads legal,
		* and gives the specs real data to assert instead of a grep through the mount.
		*
		* One list, two consumers: the module's own `inject` export, which the Client
		* loader reads, and the scoped `ctx.inject` that registers the UI. They used to
		* be two literal arrays that had to be kept in sync by hand.
		*
		* `remote.workbench` is deliberately absent — this plugin provides it.
		* `workspaces` is present because the pane's workspace picker is not optional:
		* without a workspace there is nothing to list, and the Client always ships the
		* controller. `sidebarRight` is the tab guardian's dependency; `sidebarRightTabs`
		* alone would let the type register with no controller to hold it open in.
		* `sessions` is the write-back's turn queue (§11.3).
		*
		* No runtime imports, so a spec can load this file directly.
		*/
		const CLIENT_DEPS = [
			"remote",
			"slots",
			"locale",
			"sidebarRight",
			"sidebarRightTabs",
			"workspaces",
			"sessions"
		];
		//#endregion
		//#region packages/workbench/lib/types/client/write-back.js
		/**
		* The user message that asks the model for one item's completion.
		*
		* It is sent as an ordinary user turn through the session's own queue, so it is
		* logged like anything else the user types and the model reads exactly this text.
		* The id is spelled out because the tool echoes it back to identify the item; the
		* title is there because a session can be asked about several items and the model
		* should not have to look the id up. The instruction not to re-execute the task is
		* what keeps a write-back from turning into a second implementation pass — the
		* point is to *record* work that is already done.
		* @param record - the item the user asked about.
		* @returns the message text.
		*/
		function writeBackPrompt(record) {
			return `工作项「${record.title}」（id ${record.id}）已经执行。请调用 workbench_complete，把这条工作项从开始到现在的完整成果（整体方案、实现路径、修改文件与验证结果，含后续追加的修正）一次性写回；不要只写最后一轮改动，也不要重新执行任务。`;
		}
		/**
		* Queue the user turn that asks the model for one item's completion.
		*
		* The second half of the write-back (§11.3). It is called only after the Host
		* accepted the request, so the item is already `in_progress` when the model reads
		* it. An absent service, an identity with no live session, or a service read that
		* throws degrades to a refusal rather than a rejection: a retry cannot produce
		* the missing session, and the pane still has to tell the user something.
		*
		* The service arrives as a source rather than as a value because a cordis
		* context *throws* on an undeclared property — `cannot get property "sessions"
		* without inject` — instead of answering `undefined`, and that throw used to
		* happen inside the click handler: an unhandled rejection, with the control left
		* pending forever (§9.23). Reading it here, inside the glue's own guard, turns
		* that failure into the report the pane already knows how to show.
		*
		* @param readSessions - where the sessions service is found at call time.
		* @param sessionId - the session whose queue receives the prompt.
		* @param record - the item the user asked about.
		* @returns whether the turn was queued, and why not when it was not.
		*/
		async function queueWriteBack(readSessions, sessionId, record) {
			try {
				const session = readSessions()?.binding(sessionId)?.session;
				if (session === void 0) return {
					ok: false,
					sessionMissing: true
				};
				const result = await session.prompt([{
					type: "text",
					text: writeBackPrompt(record)
				}], "queue");
				return result.ok ? { ok: true } : {
					ok: false,
					message: result.error?.message ?? ""
				};
			} catch (cause) {
				return {
					ok: false,
					message: cause instanceof Error ? cause.message : String(cause)
				};
			}
		}
		//#endregion
		//#region packages/workbench/lib/types/client/mount.js
		/**
		* Services required before the tab can be registered.
		*
		* The list lives in `deps.ts` so that this declaration and the scoped
		* `ctx.inject` below read from one place, and so a spec can assert the real list
		* rather than the mount's text (§9.23).
		*/
		const inject = [...CLIENT_DEPS];
		/**
		* Unwrap a Remote result, rethrowing a carrier failure.
		*
		* The business arms of a `WorkbenchWriteValue` are NOT failures: `conflict`,
		* `not_found`, and `invalid` arrive inside a successful result and are returned
		* to the caller, which is what lets a conflict be shown rather than thrown past
		* the user.
		* @param result - the Remote's result envelope.
		* @returns the value, when the call reached the Host.
		*/
		function unwrap(result) {
			if (!result.ok) throw result.error;
			return result.value;
		}
		/**
		* The guardian's face of `ctx.sidebarRight`.
		*
		* The controller's members are prototype methods that read `this`, and the
		* guardian holds them for the plugin's lifetime — the same hazard
		* `workspace-source.ts` documents for `ctx.workspaces.list`, so the same
		* treatment.
		*
		* The session id is resolved here and never leaves: every read asks the
		* controller which session is on screen and answers about that one. That keeps
		* the controller's branded `SessionId` on this side of the boundary — `string`
		* is not assignable to it — and leaves the guardian holding no id of its own.
		* @param ctx - Client runtime owning the right Sidebar.
		* @returns the face the guardian reads.
		*/
		function sidebarFace(ctx) {
			const sidebar = ctx.sidebarRight;
			return {
				onScreen: () => {
					const sessionId = sidebar.mounted.getSnapshot();
					if (sessionId === void 0) return void 0;
					return {
						expanded: sidebar.isExpanded(),
						kinds: sidebar.tabsIn(sessionId).map((tab) => tab.kind)
					};
				},
				openOnScreen: (kind) => {
					const sessionId = sidebar.mounted.getSnapshot();
					if (sessionId !== void 0) sidebar.openTabIn(sessionId, kind);
				},
				tabs: { subscribe: (listener) => sidebar.openTabs.subscribe(listener) },
				mounted: { subscribe: (listener) => sidebar.mounted.subscribe(listener) }
			};
		}
		/** Contribute the workbench tab type, its body, chip title, and menu entries. */
		function registerUi(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "workbench: dictionaries");
			const t = ctx.locale.bind(NS);
			ctx.effect(() => ctx.sidebarRightTabs.register(workbenchTabDefinition(t)), "workbench: tab type");
			ctx.effect(() => guardWorkbenchTab(sidebarFace(ctx), WORKBENCH_KIND, (message) => ctx.logger.error(`workbench: ${message}`)), "workbench: tab guardian");
			const gateway = {
				search: async (request) => unwrap(await ctx.remote.workbench.search(request)),
				create: async (request) => unwrap(await ctx.remote.workbench.create(request)),
				setDesc: async (request) => unwrap(await ctx.remote.workbench.setDesc(request)),
				update: async (request) => unwrap(await ctx.remote.workbench.update(request)),
				archive: async (request) => unwrap(await ctx.remote.workbench.archive(request)),
				requestComplete: async (request) => unwrap(await ctx.remote.workbench.requestComplete(request)),
				delete: async (request) => unwrap(await ctx.remote.workbench.delete(request))
			};
			const stores = /* @__PURE__ */ new Map();
			const workspaces = bindWorkspaceSource(ctx.workspaces.list);
			let follower;
			const startFollow = () => {
				follower?.abort();
				const remote = ctx.remote.workbench;
				if (typeof remote.watch !== "function") {
					ctx.logger.warn("workbench: the mounted Remote namespace has no watch method; the list updates only when opened or refreshed");
					return;
				}
				const control = new AbortController();
				follower = control;
				followChanges({
					open: () => remote.watch(),
					targets: () => [...stores.values()],
					signal: control.signal,
					onError: (error) => ctx.logger.warn(`workbench: change stream failed: ${describe(error).message}`)
				}).then((outcome) => {
					if (outcome !== "gave-up" || control.signal.aborted) return;
					ctx.logger.error("workbench: giving up on change notices — the list will only update on manual refresh");
				});
			};
			startFollow();
			ctx.effect(() => {
				const off = ctx.on("connection/reset", startFollow);
				return () => {
					off();
					follower?.abort();
					follower = void 0;
				};
			}, "workbench: change stream");
			const injected = () => ({
				storeFor: (sessionId) => {
					const existing = stores.get(sessionId);
					if (existing !== void 0) return existing;
					const created = new WorkbenchStore(gateway);
					stores.set(sessionId, created);
					return created;
				},
				workspaces,
				requestWriteBack: async (sessionId, item) => queueWriteBack(() => ctx.get("sessions"), sessionId, item),
				reportCopyFailure: (message) => {
					ctx.logger.error(`workbench: clipboard write failed: ${message}`);
				}
			});
			ctx.effect(() => () => {
				for (const store of stores.values()) store.dispose();
				stores.clear();
			}, "workbench: session stores");
			ctx.slots.inject("sidebar.right.pane.tab", () => ctx.slots.register({
				name: "sidebar.right.pane.tab",
				key: WORKBENCH_TAB_ID,
				locale: NS,
				inject: injected
			}, WorkbenchTab));
			ctx.slots.inject("sidebar.right.pane.tab.title", () => ctx.slots.register({
				name: "sidebar.right.pane.tab.title",
				key: WORKBENCH_TAB_ID,
				locale: NS,
				inject: injected
			}, WorkbenchTabTitle));
			ctx.slots.inject("sidebar.right.tab.menu.item", () => ctx.slots.register({
				name: "sidebar.right.tab.menu.item",
				id: WORKBENCH_MENU_ID,
				locale: NS,
				inject: injected
			}, WorkbenchMenuItem));
		}
		/**
		* Mount the Remote contribution unless another plugin already supplies the
		* namespace, then register the workbench tab.
		* @param ctx - Client runtime owning the Remote, dictionaries, and slots.
		* @param contribution - generated `workbench` Remote definitions.
		* @returns disposer joining the UI teardown and the Remote withdrawal.
		*/
		async function mountWorkbench(ctx, contribution) {
			const disposeRemote = ctx.get("remote.workbench") !== void 0 ? void 0 : await ctx.remote.$mount(contribution);
			const ui = ctx.inject([...CLIENT_DEPS, "remote.workbench"], registerUi);
			try {
				await ui;
			} catch (error) {
				await ui.dispose();
				await disposeRemote?.();
				throw error;
			}
			return async () => {
				await ui.dispose();
				await disposeRemote?.();
			};
		}
		//#endregion
		//#region packages/workbench/lib/types/client/index.js
		/**
		* Mount the Remote face, then the workbench tab, as one plugin lifecycle.
		* @param ctx - Client runtime owning the Remote, dictionaries, and slots.
		* @returns disposer joined over the Remote withdrawal and the UI teardown.
		*/
		async function apply(ctx) {
			return await mountWorkbench(ctx, TYPERT_REMOTE);
		}
		//#endregion
		exports.NS = NS;
		exports.WORKBENCH_KIND = WORKBENCH_KIND;
		exports.WORKBENCH_TAB_ID = WORKBENCH_TAB_ID;
		exports.apply = apply;
		exports.en = en;
		exports.guardWorkbenchTab = guardWorkbenchTab;
		exports.inject = inject;
		exports.ruleWorkbenchTab = ruleWorkbenchTab;
		exports.workbenchTabDefinition = workbenchTabDefinition;
		exports.zh = zh;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map