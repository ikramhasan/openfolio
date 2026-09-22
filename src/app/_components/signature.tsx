import { portfolio } from "./data";

const signature = portfolio.footer.signature;

/** The signature above the footer newsletter, drawn as a CSS mask so it takes the
 *  ink colour and its path stays a cached static file. */
export function Signature() {
  return (
    <div
      role="img"
      aria-label={`Signature of ${signature.owner}`}
      className="pf-signature mb-7"
    />
  );
}
