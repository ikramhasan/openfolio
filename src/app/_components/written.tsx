import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProseBody } from "./prose-body";

/**
 * One written record at its own URL: a post, a role, a project, an award.
 *
 * Not the section `Panel`. A section's heading is a label on a list and is set at
 * body size, where this heading is the piece itself. What each section puts under
 * it differs — a post has a date and a read time, a role has a company — so the
 * furniture is here and the copy is the page's.
 */
export function Written({
  title,
  standfirst,
  meta,
  cover,
  intro,
  body,
  back,
}: {
  title: string;
  /** The record's own summary, where it has one. */
  standfirst?: string | null;
  /** The line under the standfirst: dates, counts, a link out. */
  meta?: ReactNode;
  cover?: string | null;
  /** Anything of the record's that belongs above the prose. */
  intro?: ReactNode;
  body: string;
  back: { href: string; label: string };
}) {
  return (
    <article className="pf-rule pf-panel-enter border-t pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h1 className="pf-page-title">{title}</h1>

        <Link href={back.href} className="pf-link-quiet pf-meta shrink-0">
          ← {back.label}
        </Link>
      </div>

      {standfirst ? (
        <p className="pf-page-standfirst">{standfirst.trim()}</p>
      ) : null}

      {meta ? <p className="pf-meta mt-4">{meta}</p> : null}

      {cover ? (
        <Image
          src={cover}
          alt=""
          width={1600}
          height={840}
          sizes="(min-width: 1024px) 720px, 100vw"
          className="pf-frame mt-7 w-full rounded-md object-cover"
        />
      ) : null}

      {intro ? <div className="mt-7">{intro}</div> : null}

      <div className="mt-9">
        <ProseBody value={body} />
      </div>
    </article>
  );
}

/** A record's link out, set in the meta line beside the rest of it. */
export function Outbound({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="pf-link-quiet whitespace-nowrap"
    >
      {label} ↗
    </a>
  );
}
