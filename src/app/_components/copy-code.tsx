"use client";

import { useEffect, useState } from "react";

/**
 * Copy a code block's source. The only client JavaScript a reading page carries:
 * the clipboard cannot be written to from the server, and a code block without a way
 * to take the code is a code block you have to select by hand.
 *
 * The label is text rather than an icon because the rest of the site is typographic,
 * and text needs no tooltip to say what it does.
 */
export function CopyCode({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;

    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      // Refused (no permission, or no clipboard on an insecure origin). Saying
      // nothing is better than an error where a convenience used to be.
    }
  }

  return (
    <button type="button" onClick={copy} className="pf-prose-copy">
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
