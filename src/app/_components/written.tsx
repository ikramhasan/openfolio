import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ProseBody } from "./prose-body";

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
  standfirst?: string | null;
  meta?: ReactNode;
  cover?: string | null;
  intro?: ReactNode;
  body: string;
  back: { href: string; label: string };
}) {
  return (
    <article className="pf-panel-enter pt-8 lg:pt-14 xl:pt-16">
      <header>
        <Link href={back.href} className="pf-link-quiet pf-meta inline-flex">
          ← {back.label}
        </Link>

        <h1 className="pf-page-title mt-5 text-balance">{title}</h1>

        {standfirst ? (
          <p className="pf-page-standfirst mt-3 max-w-[52ch]">
            {standfirst.trim()}
          </p>
        ) : null}

        {meta ? (
          <p className="pf-rule pf-meta mt-6 border-t pt-4">{meta}</p>
        ) : null}
      </header>

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
