import type { CSSProperties } from "react";
import type { Footer } from "./types";

export function Signature({ signature }: { signature: Footer["signature"] }) {
  if (!signature.image) return null;

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
