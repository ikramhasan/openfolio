import "server-only";

import { api } from "@convex/_generated/api";
import type { WritableSection } from "@convex/lib/writable";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import type { Portfolio } from "../../_components/types";

export type Draft = {
  portfolio: Portfolio;
  storageUrls: Record<string, string>;
};

export async function load(): Promise<Draft> {
  const token = await convexAuthNextjsToken();
  return fetchQuery(api.admin.load, {}, { token });
}

export async function loadBody(section: WritableSection, slug: string) {
  const token = await convexAuthNextjsToken();
  return fetchQuery(api.bodies.load, { section, slug }, { token });
}
