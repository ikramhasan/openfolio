import type { CSSProperties } from "react";
import { portfolio } from "./data";

const signature = portfolio.footer.signature;

// A CSS custom property rather than an `<img>`: the mask keeps the ink colour,
// and the asset stays a cached static file.
const style = {
  "--pf-signature-image": `url("${signature.image}")`,
} as CSSProperties;

/** The signature above the footer newsletter. */
export function Signature() {
  return (
    <div
      role="img"
      aria-label={`Signature of ${signature.owner}`}
      style={style}
      className="pf-signature mb-7"
    />
  );
}
