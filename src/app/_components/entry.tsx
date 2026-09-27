import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

export function Logo({ src, className }: { src: string; className: string }) {
  return (
    <span className={`pf-logo relative block shrink-0 ${className}`}>
      {src ? (
        <Image src={src} alt="" fill sizes="32px" className="object-contain" />
      ) : null}
    </span>
  );
}

export function EntryList({ children }: { children: ReactNode }) {
  return <ol className="pf-rule divide-y border-t">{children}</ol>;
}

export function Entry({
  logo,
  title,
  org,
  place,
  when,
  note,
  href,
  internal = false,
  children,
}: {
  logo: string;
  title: string;
  org: string;
  place?: string;
  when: string;
  note?: string | null;
  href?: string | null;
  internal?: boolean;
  children?: ReactNode;
}) {
  const body = (
    <>
      <Logo src={logo} className="mt-0.5 size-8 rounded-[9px]" />

      <span className="grid min-w-0 gap-x-6 sm:grid-cols-[minmax(0,1fr)_auto]">
        <span className="pf-role-title">
          {title}
          {href && internal ? (
            <span aria-hidden="true" className="pf-row-arrow pf-faint ml-1.5">
              →
            </span>
          ) : null}
        </span>

        <span className="pf-meta mt-0.5 flex flex-wrap gap-x-2.5 sm:col-start-1">
          <span className="pf-strong">{org}</span>
          {place ? <span className="pf-faint">{place}</span> : null}
        </span>

        <span className="pf-meta pf-figure mt-2 flex flex-wrap gap-x-2.5 sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mt-0 sm:flex-col sm:items-end sm:gap-y-0.5 sm:pt-px">
          <span className="whitespace-nowrap">{when}</span>
          {note ? (
            <span className="pf-faint whitespace-nowrap">{note}</span>
          ) : null}
        </span>

        {children ? (
          <span className="mt-3.5 block max-w-[68ch] sm:col-span-2">
            {children}
          </span>
        ) : null}
      </span>
    </>
  );

  const className =
    "pf-row -mx-3 grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 px-3 py-6 sm:gap-x-5";

  if (!href) {
    return <div className={className}>{body}</div>;
  }

  if (internal) {
    return (
      <Link href={href} className={className}>
        {body}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {body}
    </a>
  );
}
