import type { CSSProperties } from "react";
import type { Footer } from "./types";

/** The signature above the footer newsletter. */
export function Signature({ signature }: { signature: Footer["signature"] }) {
  if (!signature.image) return null;

  // A CSS custom property rather than an `<img>`: the mask keeps the ink colour,
  // and the asset stays a cached static file. The URL is quoted, and the only
  // values that reach here are a same-origin path or an http(s) URL — see
  // `parseImage` in `convex/lib/images.ts`.
  const style = {
    "--pf-signature-image": `url("${encodeURI(signature.image)}")`,
  } as CSSProperties;

  return (
    <div
      role="img"
      aria-label={`Signature of ${signature.owner}`}
      style={style}
      className="pf-signature mb-7"
    />
  );
}
