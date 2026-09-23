import "server-only";

import { api } from "@convex/_generated/api";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import type { Portfolio } from "../../_components/types";

/**
 * The editor's read. Writes are in `actions.ts`, because they are called from the
 * client and have to be server functions; this one the layout awaits directly.
 *
 * The token comes from the request's cookies and is handed to Convex, which checks
 * it: `api.admin.load` throws for anyone who is not the admin. Read as a signed-in
 * request, image fields come back as `storage:<id>` references rather than resolved
 * URLs, so saving a record whose photograph was not touched cannot turn a stored
 * file into a URL that expires. `storageUrls` carries the previews for them.
 */

export type Draft = {
  portfolio: Portfolio;
  storageUrls: Record<string, string>;
};

export async function load(): Promise<Draft> {
  const token = await convexAuthNextjsToken();
  return fetchQuery(api.admin.load, {}, { token });
}

/**
 * One post's record and body, for the page that writes it. `null` where no post
 * carries that slug, which the route turns into a 404.
 */
export async function loadArticle(slug: string) {
  const token = await convexAuthNextjsToken();
  return fetchQuery(api.articles.load, { slug }, { token });
}
