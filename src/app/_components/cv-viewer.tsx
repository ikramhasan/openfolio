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
      <header className="pf-cv-bar">
        <div className="pf-cv-bar-inner">
          <h1 className="pf-role-title flex min-w-0 flex-wrap items-baseline gap-x-2.5 text-balance">
            <Link href="/" className="pf-cv-owner">
              {owner}
            </Link>
            <span className="pf-faint shrink-0 font-normal">CV</span>
          </h1>

          <div className="flex shrink-0 items-center gap-x-5">
            <a
              href="/cv/file"
              target="_blank"
              rel="noopener"
              className="pf-link-quiet pf-meta hidden sm:inline"
            >
              Open in new tab
            </a>

            <a href="/cv/download" className="pf-cta">
              Download PDF
            </a>
          </div>
        </div>
      </header>

      <main className="pf-cv-stage">
        <iframe
          ref={frame}
          src="/cv/file"
          title={`Curriculum vitae of ${owner}`}
          className="pf-cv-frame"
        />
      </main>
    </div>
  );
}
