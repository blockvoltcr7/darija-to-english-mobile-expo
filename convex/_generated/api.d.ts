/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as accountDeletion from "../accountDeletion.js";
import type * as artifacts from "../artifacts.js";
import type * as auth from "../auth.js";
import type * as consents from "../consents.js";
import type * as crons from "../crons.js";
import type * as health from "../health.js";
import type * as model_auth from "../model/auth.js";
import type * as model_rows from "../model/rows.js";
import type * as profiles from "../profiles.js";
import type * as storage from "../storage.js";
import type * as subscriptions from "../subscriptions.js";
import type * as translations from "../translations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  accountDeletion: typeof accountDeletion;
  artifacts: typeof artifacts;
  auth: typeof auth;
  consents: typeof consents;
  crons: typeof crons;
  health: typeof health;
  "model/auth": typeof model_auth;
  "model/rows": typeof model_rows;
  profiles: typeof profiles;
  storage: typeof storage;
  subscriptions: typeof subscriptions;
  translations: typeof translations;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
