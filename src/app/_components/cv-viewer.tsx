"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export function CvViewer({ owner }: { owner: string }) {
  const frame = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const element = frame.current;
    if (!element) return;

    const focus = () => element.focus({ preventScroll: true });

    if (element.contentDocument?.readyState === "complete") focus();
    element.addEventListener("load", focus);

    return () => element.removeEventListener("load", focus);
  }, []);

  return (
    <div className="pf-cv">
      <div className="pf-cv-bar">
        <Link href="/" className="pf-link-quiet pf-meta">
          ← Back
        </Link>

        <span className="pf-meta pf-faint truncate">{owner} — CV</span>
      </div>

      <iframe
        ref={frame}
        src="/cv/file"
        title={`Curriculum vitae of ${owner}`}
        className="pf-cv-frame"
      />

      <a
        href="/cv/download"
        className="pf-cta pf-cv-download"
        aria-label="Download the CV"
      >
        <span aria-hidden="true">↓</span>
        Download
      </a>
    </div>
  );
}
