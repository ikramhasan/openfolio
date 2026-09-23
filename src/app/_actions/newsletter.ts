"use server";

import { api } from "@convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

export async function subscribeToNewsletter(email: string): Promise<boolean> {
  if (typeof email !== "string" || email.length > 254) return false;

  try {
    const { ok } = await fetchMutation(api.newsletter.subscribe, { email });
    return ok;
  } catch {
    return false;
  }
}
