"use client";

import { useEffect, useState } from "react";

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
    } catch {}
  }

  return (
    <button type="button" onClick={copy} className="pf-prose-copy">
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
