/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin from "../admin.js";
import type * as auth from "../auth.js";
import type * as content from "../content.js";
import type * as files from "../files.js";
import type * as http from "../http.js";
import type * as lib_authz from "../lib/authz.js";
import type * as lib_images from "../lib/images.js";
import type * as lib_project from "../lib/project.js";
import type * as lib_validators from "../lib/validators.js";
import type * as lib_wire from "../lib/wire.js";
import type * as lib_write from "../lib/write.js";
import type * as newsletter from "../newsletter.js";
import type * as seed from "../seed.js";
import type * as users from "../users.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  admin: typeof admin;
  auth: typeof auth;
  content: typeof content;
  files: typeof files;
  http: typeof http;
  "lib/authz": typeof lib_authz;
  "lib/images": typeof lib_images;
  "lib/project": typeof lib_project;
  "lib/validators": typeof lib_validators;
  "lib/wire": typeof lib_wire;
  "lib/write": typeof lib_write;
  newsletter: typeof newsletter;
  seed: typeof seed;
  users: typeof users;
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

export declare const components: {
  rateLimiter: import("@convex-dev/rate-limiter/_generated/component.js").ComponentApi<"rateLimiter">;
};
