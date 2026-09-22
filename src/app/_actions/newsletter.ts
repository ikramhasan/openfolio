"use server";

import { api } from "@convex/_generated/api";
import { fetchMutation } from "convex/nextjs";

/**
 * The newsletter sign-up.
 *
 * Unauthenticated on purpose — a visitor subscribes — so the mutation behind it is
 * rate limited and validates the address again. Nothing about the caller is passed
 * on, and the result is a bare boolean: whether the address was already on the
 * list is not something this should be able to answer.
 */
export async function subscribeToNewsletter(email: string): Promise<boolean> {
  if (typeof email !== "string" || email.length > 254) return false;

  try {
    const { ok } = await fetchMutation(api.newsletter.subscribe, { email });
    return ok;
  } catch {
    // A rate-limit refusal and a deployment failure are the same answer here.
    return false;
  }
}
