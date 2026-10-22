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
		//#region packages/workbench/lib/typert.contract-BCazqAqp.js
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
					id: `${PACKAGE_NAME}#${SERVICE_KEY}/delete`,
					service: SERVICE_KEY,
					namespace: SERVICE_KEY,
					method: "delete",
					invocation: { kind: "direct" },
					parameters: [param("request", "WorkbenchDeleteRequest", deleteRequestSchema)],
					result: codec("WorkbenchDeleteValue", deleteValueSchema)
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
		//#region \0dsh-css:D:\Workbase\dsh-plugins\dsh-plugin-workbench\packages\workbench\src\client\WorkbenchTab.module.css.mjs
		const css$1 = ".SWF62W_pane{--wb-tertiary:color-mix(in srgb, var(--dsw-alias-label-secondary) 72%, var(--dsw-alias-bg-base));--wb-caption:color-mix(in srgb, var(--dsw-alias-label-secondary) 51%, var(--dsw-alias-bg-base));--wb-business:var(--dsw-alias-brand-primary);--wb-hover:color-mix(in srgb, var(--dsw-alias-label-primary) 6%, transparent);--wb-border-strong:color-mix(in srgb, var(--dsw-alias-label-primary) 18%, transparent);--wb-accent-wash:color-mix(in srgb, var(--dsw-alias-brand-primary) 14%, transparent);--wb-accent:var(--dsw-alias-state-success-primary);--wb-accent-soft:color-mix(in srgb, var(--wb-accent) 15%, transparent);--wb-accent-fill:color-mix(in srgb, var(--wb-accent) 92%, var(--dsw-alias-bg-base));--wb-on-accent:var(--dsw-alias-bg-base);--wb-body:color-mix(in srgb, var(--dsw-alias-label-secondary) 92%, var(--dsw-alias-bg-base));--wb-card-shadow:0 1px 2px #0000000a, 0 8px 20px -14px #00000038;--wb-card-shadow-hover:0 2px 4px #0000000d, 0 12px 26px -14px #00000042;width:100%;height:100%;min-height:0;color:var(--dsw-alias-label-primary);--wb-jelly:cubic-bezier(.34, 1.56, .64, 1);flex-direction:column;display:flex;container:SWF62W_wb-pane/inline-size}.SWF62W_toolbar{flex-direction:column;flex:none;padding:14px 16px 0;display:flex}.SWF62W_searchRow{align-items:center;gap:8px;display:flex}.SWF62W_searchField{border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-layer-1);min-width:0;height:36px;color:var(--wb-tertiary);border-radius:13px;flex:1;align-items:center;gap:8px;padding:0 11px;transition:border-color .15s,background .15s;display:flex}.SWF62W_searchField:focus-within{border-color:var(--wb-business);background:var(--dsw-alias-bg-base)}.SWF62W_searchInput{min-width:0;height:100%;color:var(--dsw-alias-label-primary);font:inherit;background:0 0;border:0;outline:none;flex:1;padding:0;font-size:13px}.SWF62W_searchInput::placeholder{color:var(--wb-caption)}.SWF62W_filterRow{align-items:center;gap:8px;margin-top:12px;display:flex}.SWF62W_chip{background:var(--dsw-alias-bg-layer-1);height:28px;color:var(--dsw-alias-label-secondary);font:inherit;cursor:pointer;white-space:nowrap;border:.5px solid #0000;border-radius:999px;flex:none;align-items:center;gap:5px;padding:0 11px;font-size:12.5px;transition:background .13s,color .13s;display:inline-flex}.SWF62W_chip:hover{background:var(--dsw-alias-bg-layer-2)}.SWF62W_chip:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.SWF62W_chipFlat{background:0 0;height:26px}.SWF62W_chipFlat:hover{background:var(--dsw-alias-interactive-bg-hover)}.SWF62W_chipActive{background:var(--wb-accent-wash);color:var(--wb-business)}.SWF62W_chipActive:hover{background:color-mix(in srgb, var(--dsw-alias-brand-primary) 20%, transparent)}.SWF62W_chipCount{color:inherit;opacity:.62;font-variant-numeric:tabular-nums}.SWF62W_titleIcon{vertical-align:-2px;flex:none;margin-right:6px}.SWF62W_filterSpacer{flex:1;min-width:0}.SWF62W_iconBtn{width:28px;height:28px;color:var(--wb-tertiary);cursor:pointer;background:0 0;border:0;border-radius:9px;flex:none;justify-content:center;align-items:center;transition:background .13s,color .13s;display:inline-flex}.SWF62W_iconBtn:hover{background:var(--wb-hover);color:var(--dsw-alias-label-primary)}.SWF62W_iconBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}button[data-dockkit-tab-close=dsh-plugin-workbench\\/workbench]{display:none}.SWF62W_scroller{scrollbar-gutter:stable;flex:1;min-height:0;padding:14px 14px 24px;overflow:auto;container-type:size}.SWF62W_groupLabel{color:var(--wb-caption);letter-spacing:.02em;align-items:center;gap:8px;margin:4px 4px 9px;font-size:11.5px;font-weight:500;display:flex}.SWF62W_groupLabel:after{content:\"\";background:var(--dsw-alias-border-l1);flex:1;height:.5px}.SWF62W_list+.SWF62W_groupLabel{margin-top:20px}.SWF62W_list{flex-direction:column;gap:9px;margin:0;padding:0;list-style:none;display:flex}.SWF62W_card{border:.5px solid var(--dsw-alias-border-l1);background:linear-gradient(158deg, color-mix(in srgb, var(--wb-accent) 4%, var(--dsw-alias-bg-base)), color-mix(in srgb, var(--wb-accent) 8%, var(--dsw-alias-bg-base)));box-shadow:var(--wb-card-shadow);border-radius:14px;padding:12px 13px 13px;font-weight:500;transition:box-shadow .16s,border-color .16s}.SWF62W_card:hover{box-shadow:var(--wb-card-shadow-hover)}.SWF62W_cardComposing{border-color:color-mix(in srgb, var(--wb-accent) 46%, transparent)}.SWF62W_cardDone{box-shadow:0 1px 2px #00000008}.SWF62W_cardDone:hover{box-shadow:var(--wb-card-shadow-hover)}.SWF62W_cardArchived{background:color-mix(in srgb, var(--dsw-alias-label-primary) 4%, transparent);border-style:dashed}.SWF62W_cardArchived .SWF62W_mark{opacity:.55}.SWF62W_cardArchived .SWF62W_titleText{color:var(--wb-tertiary)}.SWF62W_cardHead{align-items:flex-start;gap:9px;display:flex}.SWF62W_mark{width:20px;height:20px;color:var(--dsw-alias-state-idle-primary);background:0 0;border-radius:999px;flex:none;place-items:center;margin-top:1px;transition:background .16s,color .16s;display:grid}.SWF62W_markDot{background:currentColor;border-radius:50%;width:9px;height:9px}.SWF62W_markDone,.SWF62W_markBusy{background:var(--wb-accent-soft);color:var(--wb-accent)}.SWF62W_cardBody{flex-direction:column;flex:1;min-width:0;display:flex}.SWF62W_titleRow{align-items:center;gap:6px;min-width:0;display:flex}.SWF62W_titleText{min-width:0;color:var(--dsw-alias-label-primary);font:inherit;letter-spacing:-.01em;text-align:left;cursor:text;text-overflow:ellipsis;white-space:nowrap;background:0 0;border:0;border-radius:6px;flex:1;margin:0;padding:0 4px;font-size:14px;font-weight:500;line-height:20px;overflow:hidden}.SWF62W_titleText:hover{background:var(--wb-hover)}.SWF62W_descText{-webkit-line-clamp:2;line-clamp:2;color:var(--wb-body);font:inherit;text-align:left;white-space:pre-wrap;cursor:text;overflow-wrap:anywhere;background:0 0;border:0;border-radius:6px;-webkit-box-orient:vertical;margin:5px 0 0;padding:0 4px;font-size:12px;line-height:19px;display:-webkit-box;overflow:hidden}.SWF62W_descText:hover{background:var(--wb-hover)}.SWF62W_descEmpty{color:var(--wb-caption);font-style:italic}.SWF62W_metaRow{min-width:0;color:var(--wb-body);align-items:center;gap:5px;margin-top:12px;font-size:11.5px;line-height:17px;display:flex}.SWF62W_metaRow>svg{color:var(--wb-caption);flex:none}.SWF62W_metaLabel{color:inherit;flex:none}.SWF62W_metaSpacer{flex:1;min-width:0}.SWF62W_tag{max-width:150px;color:var(--wb-body);font:inherit;cursor:text;text-overflow:ellipsis;white-space:nowrap;background:0 0;border:.5px solid #0000;border-radius:6px;flex:none;align-items:center;padding:2px 4px;font-size:11.5px;line-height:17px;transition:background .13s,color .13s;display:inline-flex;overflow:hidden}.SWF62W_tag:hover{background:var(--wb-hover);color:var(--dsw-alias-label-secondary)}.SWF62W_tagEmpty{color:var(--wb-caption)}.SWF62W_statusPill{white-space:nowrap;border:.5px solid #0000;border-radius:999px;flex:none;align-items:center;gap:4px;height:21px;padding:0 8px 0 6px;font-size:10.5px;font-weight:500;line-height:1;display:inline-flex}.SWF62W_statusPillDone{border-color:color-mix(in srgb, var(--wb-accent) 46%, transparent);background:var(--wb-accent-soft);color:color-mix(in srgb, var(--wb-accent) 86%, var(--dsw-alias-label-primary))}.SWF62W_statusPillBusy{border-color:color-mix(in srgb, var(--wb-business) 30%, transparent);background:color-mix(in srgb, var(--wb-business) 10%, transparent);color:var(--wb-business)}.SWF62W_statusPip{background:currentColor;border-radius:50%;width:5px;height:5px;animation:1.8s ease-in-out infinite SWF62W_wb-status-breathe}@keyframes SWF62W_wb-status-breathe{0%,to{opacity:1}50%{opacity:.35}}.SWF62W_archivedBadge{background:color-mix(in srgb, var(--dsw-alias-label-primary) 7%, transparent);height:19px;color:var(--wb-caption);white-space:nowrap;border-radius:999px;flex:none;align-items:center;padding:0 7px;font-size:10px;line-height:1;display:inline-flex}.SWF62W_time{color:var(--wb-caption);font-variant-numeric:tabular-nums;flex:none;font-size:10.5px}.SWF62W_cardFoot{align-items:center;gap:6px;margin-top:14px;display:flex}.SWF62W_footSpacer{flex:1;min-width:0}.SWF62W_primaryBtn{background:var(--wb-accent-fill);height:26px;color:var(--wb-on-accent);font:inherit;cursor:pointer;box-shadow:0 1px 2px color-mix(in srgb, var(--wb-accent) 28%, transparent);border:0;border-radius:10px;flex:none;justify-content:center;align-items:center;gap:5px;padding:0 8px;font-size:12px;font-weight:500;transition:filter .13s,box-shadow .16s;display:inline-flex}.SWF62W_primaryBtn:hover{filter:brightness(1.06);box-shadow:0 2px 6px color-mix(in srgb, var(--wb-accent) 34%, transparent)}.SWF62W_primaryBtn:active{filter:brightness(.95)}.SWF62W_primaryBtn:focus-visible{outline:2px solid var(--wb-accent);outline-offset:1px}.SWF62W_ghostBtn{border:.5px solid var(--dsw-alias-border-l2);background:color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);height:26px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:10px;flex:none;justify-content:center;align-items:center;gap:5px;padding:0 8px;font-size:12px;font-weight:500;transition:background .13s,border-color .13s,color .13s;display:inline-flex}.SWF62W_ghostBtn:hover{background:var(--dsw-alias-bg-base);border-color:var(--wb-border-strong)}.SWF62W_ghostBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.SWF62W_ghostBtnBusy{border-color:color-mix(in srgb, var(--wb-business) 38%, transparent);color:var(--wb-business)}.SWF62W_ghostBtnBusy:hover{color:var(--wb-business)}.SWF62W_ghostBtnPending{color:var(--wb-business);cursor:default;animation:1.6s ease-in-out infinite SWF62W_wb-writeback-wait}.SWF62W_ghostBtnPending:hover{background:color-mix(in srgb, var(--dsw-alias-bg-base) 55%, transparent);border-color:var(--dsw-alias-border-l2);color:var(--wb-business)}@keyframes SWF62W_wb-writeback-wait{0%,to{opacity:1}50%{opacity:.45}}.SWF62W_cardActions{flex:none;align-items:center;margin-right:-3px;display:inline-flex}.SWF62W_chevron{min-width:0;height:26px;color:var(--wb-tertiary);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:10px;flex:0 auto;justify-content:center;align-items:center;gap:4px;padding:0 6px 0 4px;font-size:12px;font-weight:500;transition:background .13s,color .13s;display:inline-flex}.SWF62W_chevron>span{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}@container SWF62W_wb-pane (width<=306px){.SWF62W_chevron>span{display:none}.SWF62W_chevron{padding:0 4px}}.SWF62W_chevron:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.SWF62W_chevronOpen svg{rotate:180deg}.SWF62W_chevron svg{transition:rotate .3s var(--wb-jelly), scale .12s ease}.SWF62W_chevron:active svg{scale:.82}.SWF62W_field{box-sizing:border-box;background:var(--wb-hover);width:100%;color:inherit;font:inherit;text-align:left;caret-color:var(--wb-business);border:0;border-radius:6px;outline:none;margin:0;padding:0}.SWF62W_fieldTitle{letter-spacing:-.01em;color:var(--dsw-alias-label-primary);padding:0 4px;font-size:14px;font-weight:500;line-height:20px}.SWF62W_fieldDesc{height:19px;max-height:38px;transition:height .24s var(--wb-jelly);resize:none;color:var(--wb-tertiary);margin-top:5px;padding:0 4px;font-size:12px;line-height:19px;display:block;overflow-y:auto}.SWF62W_fieldTag{width:120px;color:var(--dsw-alias-label-secondary);background:var(--wb-hover);border:.5px solid #0000;border-radius:6px;flex:none;padding:2px 4px;font-size:11.5px;line-height:17px}.SWF62W_field::placeholder{color:var(--wb-caption);font-style:normal;font-weight:500}.SWF62W_field.SWF62W_fieldDesc::placeholder{font-style:italic}.SWF62W_editHint{color:var(--wb-caption);margin:6px 0 0;font-size:10px}.SWF62W_detailWrap{transition:grid-template-rows .24s var(--wb-jelly);grid-template-rows:0fr;display:grid}.SWF62W_detailWrap>.SWF62W_detail{visibility:hidden;min-height:0;max-height:50cqh;transition:visibility 0s linear .24s;overflow:hidden}.SWF62W_detailOpen{transition:grid-template-rows .38s var(--wb-jelly);grid-template-rows:1fr}.SWF62W_detailOpen>.SWF62W_detail{visibility:visible;transition:visibility;overflow:clip auto}.SWF62W_detail{padding:2px 0 2px 29px}.SWF62W_detailBar{justify-content:flex-end;align-items:center;gap:8px;margin-top:12px;display:flex}.SWF62W_detailDelete{width:24px;height:24px;color:var(--wb-caption);cursor:pointer;background:0 0;border:0;border-radius:8px;flex:none;justify-content:center;align-items:center;margin-right:-4px;padding:0;transition:background .13s,color .13s;display:inline-flex}.SWF62W_detailDelete:hover{background:color-mix(in srgb, var(--dsw-alias-state-error-primary) 14%, transparent);color:var(--dsw-alias-state-error-primary)}.SWF62W_detailDelete:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}@media (prefers-reduced-motion:reduce){.SWF62W_detailDelete{transition:none}}.SWF62W_detailHint{color:var(--wb-caption);margin:12px 0 0;font-size:10.5px}.SWF62W_detailEmpty{color:var(--wb-caption);margin:0;font-size:10.5px}.SWF62W_completionDivider{color:var(--wb-caption);letter-spacing:.02em;align-items:center;gap:8px;margin:0 0 12px;font-size:10px;font-weight:500;display:flex}.SWF62W_completionDivider:before,.SWF62W_completionDivider:after{content:\"\";background:var(--dsw-alias-border-l1);flex:1;height:.5px}.SWF62W_completionSummary{color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;margin:0;font-size:11.5px;line-height:19px}.SWF62W_completionBlockTitle{color:var(--wb-caption);margin:0 0 6px;font-size:10px;font-weight:500}.SWF62W_completionBlock{margin:13px 0 0}.SWF62W_completionList{flex-direction:column;gap:6px;margin:0;padding:0;font-size:11px;line-height:17px;list-style:none;display:flex}.SWF62W_completionSteps{color:var(--dsw-alias-label-secondary);flex-direction:column;gap:6px;margin:0;padding-left:18px;font-size:11px;line-height:17px;display:flex}.SWF62W_completionSteps li::marker{color:var(--wb-caption)}.SWF62W_completionRow{align-items:baseline;gap:7px;display:flex}.SWF62W_filePath{color:var(--dsw-alias-label-primary);overflow-wrap:anywhere;font-size:10.5px}.SWF62W_filePurpose{color:var(--wb-tertiary);font-size:10.5px}.SWF62W_verifyCmd{color:var(--dsw-alias-label-secondary);overflow-wrap:anywhere;font-size:10.5px}.SWF62W_verifyResult{white-space:nowrap;flex:none;font-size:10px;font-weight:500}.SWF62W_verifyPassed{color:var(--dsw-alias-state-success-primary)}.SWF62W_verifyFailed{color:var(--dsw-alias-state-error-primary)}.SWF62W_verifySkipped{color:var(--wb-caption)}.SWF62W_completionBy{color:var(--wb-caption);margin:11px 0 0;font-size:10px}.SWF62W_status{color:var(--wb-caption);margin:0;font-size:12px}.SWF62W_statusError{color:var(--dsw-alias-state-error-primary)}.SWF62W_retryBtn{border:.5px solid var(--dsw-alias-border-l2);background:var(--dsw-alias-bg-base);height:30px;color:var(--dsw-alias-label-primary);font:inherit;cursor:pointer;border-radius:999px;align-self:flex-start;margin-top:8px;padding:0 13px;font-size:12.5px;transition:background .13s}.SWF62W_retryBtn:hover{background:var(--dsw-alias-bg-layer-2)}.SWF62W_retryBtn:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px}.SWF62W_notice{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 16%, transparent);color:var(--dsw-alias-label-primary);border-radius:12px;margin:0 0 9px;padding:9px 11px;font-size:12.5px;line-height:19px}.SWF62W_skeletonList{flex-direction:column;gap:9px;display:flex}.SWF62W_skeleton{background:var(--dsw-alias-bg-layer-1);border-radius:14px;height:132px;animation:1.6s ease-in-out infinite SWF62W_wb-pulse}@keyframes SWF62W_wb-pulse{0%,to{opacity:1}50%{opacity:.55}}@media (prefers-reduced-motion:reduce){.SWF62W_skeleton,.SWF62W_statusPip,.SWF62W_ghostBtnPending{animation:none}.SWF62W_card,.SWF62W_chevron,.SWF62W_chevron svg,.SWF62W_chip,.SWF62W_detailWrap,.SWF62W_detailWrap>.SWF62W_detail,.SWF62W_fieldDesc,.SWF62W_ghostBtn,.SWF62W_iconBtn,.SWF62W_mark,.SWF62W_primaryBtn,.SWF62W_retryBtn,.SWF62W_searchField,.SWF62W_tag{transition:none}.SWF62W_chevron:active svg{scale:none}}.SWF62W_empty{text-align:center;flex-direction:column;justify-content:center;align-items:center;padding:60px 24px;display:flex}.SWF62W_emptyGlyph{color:var(--wb-caption);margin-bottom:14px}.SWF62W_empty p{color:var(--wb-tertiary);margin:0;font-size:13px}.SWF62W_pane .SWF62W_emptyHint{color:var(--wb-caption);margin:6px 0 0;font-size:12px}";
		const tagId$1 = "dsh-plugin-workbench/WorkbenchTab.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-plugin-workbench";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var WorkbenchTab_module_css_default = {
			"archivedBadge": "SWF62W_archivedBadge",
			"card": "SWF62W_card",
			"cardActions": "SWF62W_cardActions",
			"cardArchived": "SWF62W_cardArchived",
			"cardBody": "SWF62W_cardBody",
			"cardComposing": "SWF62W_cardComposing",
			"cardDone": "SWF62W_cardDone",
			"cardFoot": "SWF62W_cardFoot",
			"cardHead": "SWF62W_cardHead",
			"chevron": "SWF62W_chevron",
			"chevronOpen": "SWF62W_chevronOpen",
			"chip": "SWF62W_chip",
			"chipActive": "SWF62W_chipActive",
			"chipCount": "SWF62W_chipCount",
			"chipFlat": "SWF62W_chipFlat",
			"completionBlock": "SWF62W_completionBlock",
			"completionBlockTitle": "SWF62W_completionBlockTitle",
			"completionBy": "SWF62W_completionBy",
			"completionDivider": "SWF62W_completionDivider",
			"completionList": "SWF62W_completionList",
			"completionRow": "SWF62W_completionRow",
			"completionSteps": "SWF62W_completionSteps",
			"completionSummary": "SWF62W_completionSummary",
			"descEmpty": "SWF62W_descEmpty",
			"descText": "SWF62W_descText",
			"detail": "SWF62W_detail",
			"detailBar": "SWF62W_detailBar",
			"detailDelete": "SWF62W_detailDelete",
			"detailEmpty": "SWF62W_detailEmpty",
			"detailHint": "SWF62W_detailHint",
			"detailOpen": "SWF62W_detailOpen",
			"detailWrap": "SWF62W_detailWrap",
			"editHint": "SWF62W_editHint",
			"empty": "SWF62W_empty",
			"emptyGlyph": "SWF62W_emptyGlyph",
			"emptyHint": "SWF62W_emptyHint",
			"field": "SWF62W_field",
			"fieldDesc": "SWF62W_fieldDesc",
			"fieldTag": "SWF62W_fieldTag",
			"fieldTitle": "SWF62W_fieldTitle",
			"filePath": "SWF62W_filePath",
			"filePurpose": "SWF62W_filePurpose",
			"filterRow": "SWF62W_filterRow",
			"filterSpacer": "SWF62W_filterSpacer",
			"footSpacer": "SWF62W_footSpacer",
			"ghostBtn": "SWF62W_ghostBtn",
			"ghostBtnBusy": "SWF62W_ghostBtnBusy",
			"ghostBtnPending": "SWF62W_ghostBtnPending",
			"groupLabel": "SWF62W_groupLabel",
			"iconBtn": "SWF62W_iconBtn",
			"list": "SWF62W_list",
			"mark": "SWF62W_mark",
			"markBusy": "SWF62W_markBusy",
			"markDone": "SWF62W_markDone",
			"markDot": "SWF62W_markDot",
			"metaLabel": "SWF62W_metaLabel",
			"metaRow": "SWF62W_metaRow",
			"metaSpacer": "SWF62W_metaSpacer",
			"notice": "SWF62W_notice",
			"pane": "SWF62W_pane",
			"primaryBtn": "SWF62W_primaryBtn",
			"retryBtn": "SWF62W_retryBtn",
			"scroller": "SWF62W_scroller",
			"searchField": "SWF62W_searchField",
			"searchInput": "SWF62W_searchInput",
			"searchRow": "SWF62W_searchRow",
			"skeleton": "SWF62W_skeleton",
			"skeletonList": "SWF62W_skeletonList",
			"status": "SWF62W_status",
			"statusError": "SWF62W_statusError",
			"statusPill": "SWF62W_statusPill",
			"statusPillBusy": "SWF62W_statusPillBusy",
			"statusPillDone": "SWF62W_statusPillDone",
			"statusPip": "SWF62W_statusPip",
			"tag": "SWF62W_tag",
			"tagEmpty": "SWF62W_tagEmpty",
			"time": "SWF62W_time",
			"titleIcon": "SWF62W_titleIcon",
			"titleRow": "SWF62W_titleRow",
			"titleText": "SWF62W_titleText",
			"toolbar": "SWF62W_toolbar",
			"verifyCmd": "SWF62W_verifyCmd",
			"verifyFailed": "SWF62W_verifyFailed",
			"verifyPassed": "SWF62W_verifyPassed",
			"verifyResult": "SWF62W_verifyResult",
			"verifySkipped": "SWF62W_verifySkipped",
			"wb-pane": "SWF62W_wb-pane",
			"wb-pulse": "SWF62W_wb-pulse",
			"wb-status-breathe": "SWF62W_wb-status-breathe",
			"wb-writeback-wait": "SWF62W_wb-writeback-wait"
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
			* Delete one item, after asking.
			*
			* Deletion is the only irreversible thing this pane offers — everything else is
			* an edit to a record that keeps its identity — so it is the one action that
			* gets a confirmation. The text names the title, because a list of similar
			* items is exactly where a misclick happens.
			* @param item - the record to delete.
			*/
			const removeItem = async (item) => {
				if (!window.confirm(t("action.deleteConfirm", { title: item.title }))) return;
				setNotice(void 0);
				const result = await store.remove(item.id);
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
								className: [
									WorkbenchTab_module_css_default.chip,
									(tier === "all" || tier === "active") && WorkbenchTab_module_css_default.chipFlat,
									tier === snapshot.filter && WorkbenchTab_module_css_default.chipActive
								].filter(Boolean).join(" "),
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
								children: [(0, react_jsx_runtime.jsx)(EmptyGlyph, {}), snapshot.query !== "" || snapshot.filter !== "all" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("p", { children: t("empty.filtered") }), (0, react_jsx_runtime.jsx)("p", {
									className: WorkbenchTab_module_css_default.emptyHint,
									children: t("empty.filteredHint")
								})] }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("p", { children: t("empty.title") }), (0, react_jsx_runtime.jsx)("p", {
									className: WorkbenchTab_module_css_default.emptyHint,
									children: t("empty.hint")
								})] })]
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
									onDelete: () => {
										removeItem(item);
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
									onDelete: () => {
										removeItem(item);
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
		function Card({ item, t, editing, open, pending = false, onEdit, onCommit, onCancel, onToggle, onDelete, onRequestComplete, onFill }) {
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
							item.completion === void 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: WorkbenchTab_module_css_default.detailEmpty,
								children: t("detail.noCompletion")
							}) : (0, react_jsx_runtime.jsx)(Completion, {
								item,
								t
							}),
							item.status !== "done" && (0, react_jsx_runtime.jsx)("p", {
								className: WorkbenchTab_module_css_default.detailHint,
								children: t(pending ? "writeback.pending" : item.status === "in_progress" ? "writeback.hintRunning" : "writeback.hintQueued")
							}),
							(0, react_jsx_runtime.jsx)("div", {
								className: WorkbenchTab_module_css_default.detailBar,
								children: (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: WorkbenchTab_module_css_default.detailDelete,
									title: t("action.delete"),
									"aria-label": t("action.delete"),
									onClick: onDelete,
									children: (0, react_jsx_runtime.jsx)(TrashGlyph, {})
								})
							})
						]
					})
				})]
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
				width: "12",
				height: "12",
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
		/** Delete: a lidded bin, drawn at the fill glyph's weight so the pair matches. */
		function TrashGlyph() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "13",
				height: "13",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": "true",
				children: [
					(0, react_jsx_runtime.jsx)("path", {
						d: "M2.8 4.4h10.4",
						stroke: "currentColor",
						strokeWidth: "1.4",
						strokeLinecap: "round"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M6.4 4.4V3.1a.7.7 0 0 1 .7-.7h1.8a.7.7 0 0 1 .7.7v1.3",
						stroke: "currentColor",
						strokeWidth: "1.4",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M4.3 4.4l.5 7.8a1.5 1.5 0 0 0 1.5 1.4h3.4a1.5 1.5 0 0 0 1.5-1.4l.5-7.8",
						stroke: "currentColor",
						strokeWidth: "1.4",
						strokeLinecap: "round",
						strokeLinejoin: "round"
					}),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M6.7 6.9v3.9M9.3 6.9v3.9",
						stroke: "currentColor",
						strokeWidth: "1.3",
						strokeLinecap: "round"
					})
				]
			});
		}
		/** The empty state's mark: a sheet with a line of text, above the sentence. */
		function EmptyGlyph() {
			return (0, react_jsx_runtime.jsxs)("svg", {
				className: WorkbenchTab_module_css_default.emptyGlyph,
				width: "28",
				height: "28",
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
		/** Replace one record in a list, leaving the list untouched when it holds none. */
		function replace(items, next) {
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
		//#region \0dsh-css:D:\Workbase\dsh-plugins\dsh-plugin-workbench\packages\workbench\src\client\WorkbenchMenu.module.css.mjs
		const css = ".--G6vq_item{width:100%;color:var(--dsw-alias-label-primary);font:inherit;text-align:left;white-space:nowrap;cursor:pointer;background:0 0;border:0;border-radius:7px;align-items:center;padding:6px 10px;font-size:12.5px;display:flex}.--G6vq_item:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary) 8%, transparent)}";
		const tagId = "dsh-plugin-workbench/WorkbenchMenu.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-plugin-workbench";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var WorkbenchMenu_module_css_default = { "item": "--G6vq_item" };
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
			"empty.title": "这个工作区还没有工作项",
			"empty.hint": "用筛选行右侧的「+」新建一条",
			"empty.filtered": "这一档没有工作项",
			"empty.filteredHint": "换个筛选档，或把搜索词清空。",
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
			"group.active": "未完成",
			"group.done": "已完成",
			"group.archived": "已归档",
			"detail.noCompletion": "还没有待办总结",
			"writeback.request": "待办总结",
			"writeback.retry": "待办总结 · 重新写回",
			"writeback.pending": "已发送，等待模型写回…",
			"writeback.hintQueued": "写回后本条自动完结",
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
			"empty.title": "No work items in this workspace",
			"empty.hint": "Create one with the “+” at the right of the filter row",
			"empty.filtered": "Nothing in this tier",
			"empty.filteredHint": "Try another tier, or clear the search box.",
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
			"group.active": "Open",
			"group.done": "Done",
			"group.archived": "Archived",
			"detail.noCompletion": "No to-do summary yet",
			"writeback.request": "To-do summary",
			"writeback.retry": "To-do summary · write back again",
			"writeback.pending": "Sent, waiting for the model…",
			"writeback.hintQueued": "The write-back completes this item",
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
				requestComplete: async (request) => unwrap(await ctx.remote.workbench.requestComplete(request)),
				delete: async (request) => unwrap(await ctx.remote.workbench.delete(request))
			};
			const stores = /* @__PURE__ */ new Map();
			const workspaces = bindWorkspaceSource(ctx.workspaces.list);
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