import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { getExperience, getWritten } from "./content";
import {
  byOrder,
  cleanBullet,
  monthIndex,
  monthLabel,
  monthRange,
  rangeQualifier,
  tenure,
} from "./data";
import type { ExperienceSection } from "./types";
import { readPath, slugOf } from "./writing";

type Item = ExperienceSection["items"][number];

type Role = {
  item: Item;
  anchor: string;
  start: number;
  end: number;
  current: boolean;
};

const LANE_HEIGHT = 30;
const LABEL_EDGE = 88;

function Logo({ src, className }: { src: string; className: string }) {
  return (
    <span className={`pf-logo relative block shrink-0 ${className}`}>
      {src ? (
        <Image src={src} alt="" fill sizes="32px" className="object-contain" />
      ) : null}
    </span>
  );
}

function Ruler({ roles, now }: { roles: Role[]; now: number }) {
  const placed = [...roles].sort((a, b) => a.start - b.start);
  const lanes: Role[] = [];
  const laneOf = new Map<Role, number>();
  const drawnEnd = new Map<Role, number>();

  for (const role of placed) {
    const free = lanes.findIndex((last) => last.end - 1 <= role.start);
    const lane = free === -1 ? lanes.length : free;
    const previous = lanes[lane];
    if (previous) {
      drawnEnd.set(previous, Math.min(previous.end, role.start));
    }
    lanes[lane] = role;
    laneOf.set(role, lane);
  }

  const from = Math.floor(placed[0].start / 12) * 12;
  const to = Math.max(now + 1, ...placed.map((role) => role.end));
  const at = (month: number) => ((month - from) / (to - from)) * 100;
  const ongoing = placed.some((role) => role.current);

  const years: number[] = [];
  for (let year = from / 12; year * 12 < to; year++) years.push(year);

  return (
    <nav aria-label="Career timeline" className="mb-8">
      <ol className="relative" style={{ height: lanes.length * LANE_HEIGHT }}>
        {placed.map((role) => {
          const left = at(role.start);
          const width = at(drawnEnd.get(role) ?? role.end) - left;
          const style: CSSProperties = {
            left: `calc(${left}% + 1px)`,
            width: `calc(${width}% - 2px)`,
            top: (laneOf.get(role) ?? 0) * LANE_HEIGHT,
          };
          const until = role.current ? "now" : monthLabel(role.end - 1);

          return (
            <li key={role.anchor} className="absolute" style={style}>
              <a
                href={`#${role.anchor}`}
                aria-label={`${role.item.company}, ${monthLabel(role.start)} to ${until}`}
                className="pf-span block"
                data-current={role.current ? "true" : undefined}
              >
                <Logo src={role.item.logo} className="size-4 rounded-[4px]" />
                <span className="pf-span-bar mt-1.5 block h-[5px] rounded-full" />
              </a>
            </li>
          );
        })}
      </ol>

      <div aria-hidden="true" className="pf-rule relative mt-1 h-6 border-t">
        {years.map((year) => {
          const left = at(year * 12);
          if (left < 0 || (ongoing && left > LABEL_EDGE)) return null;

          return (
            <span
              key={year}
              className="pf-meta pf-faint pf-figure absolute top-1.5 pl-1.5 leading-none"
              style={{ left: `${left}%` }}
            >
              <span className="pf-tick absolute top-[-6px] left-0 h-[9px] w-px" />
              {year}
            </span>
          );
        })}

        {ongoing ? (
          <span className="pf-meta pf-faint absolute top-1.5 right-0 leading-none">
            Now
          </span>
        ) : null}
      </div>
    </nav>
  );
}

function Entry({
  role,
  href,
  internal,
}: {
  role: Role;
  href: string | null;
  internal: boolean;
}) {
  const { item } = role;
  const qualifier = rangeQualifier(item.dateRange);
  const length = role.current ? null : tenure(role.end - role.start);
  const note = [length, qualifier?.toLowerCase()].filter(Boolean).join(", ");

  const body = (
    <>
      <Logo src={item.logo} className="mt-0.5 size-8 rounded-[9px]" />

      <span className="grid min-w-0 gap-x-6 sm:grid-cols-[minmax(0,1fr)_auto]">
        <span className="pf-role-title">
          {item.title}
          {href ? (
            <span aria-hidden="true" className="pf-row-arrow pf-faint ml-1.5">
              {internal ? "→" : "↗"}
            </span>
          ) : null}
        </span>

        <span className="pf-meta mt-0.5 flex flex-wrap gap-x-2.5 sm:col-start-1">
          <span className="pf-strong">{item.company}</span>
          <span className="pf-faint">{item.location.trim()}</span>
        </span>

        <span className="pf-meta pf-figure mt-2 flex flex-wrap gap-x-2.5 sm:col-start-2 sm:row-span-2 sm:row-start-1 sm:mt-0 sm:flex-col sm:items-end sm:gap-y-0.5 sm:pt-px">
          <span className="whitespace-nowrap">
            {monthLabel(role.start)} –{" "}
            {role.current ? "Now" : monthLabel(role.end - 1)}
          </span>
          {note ? (
            <span className="pf-faint whitespace-nowrap">{note}</span>
          ) : null}
        </span>

        {item.details.length ? (
          <span className="mt-3.5 block max-w-[68ch] space-y-1.5 sm:col-span-2">
            {item.details.map((detail) => {
              const text = cleanBullet(detail);
              return (
                <span key={text} className="pf-body pf-detail block">
                  {text}
                </span>
              );
            })}
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

export async function Experience() {
  const [{ items }, written] = await Promise.all([
    getExperience(),
    getWritten("experience"),
  ]);

  const native = new Set(written);
  const now = monthIndex(new Date());

  const roles = byOrder(items).map((item): Role => {
    const range = monthRange(item.dateRange);
    const start = range?.start ?? now;
    const end = range ? (range.end ?? now) + 1 : now + 1;

    return {
      item,
      anchor: `role-${slugOf(item)}`,
      start,
      end,
      current: range ? range.end === null : false,
    };
  });

  return (
    <div>
      {roles.length > 1 ? <Ruler roles={roles} now={now} /> : null}

      <ol className="pf-rule divide-y border-t">
        {roles.map((role) => {
          const slug = slugOf(role.item);
          const here = native.has(slug);
          const href = here ? readPath("experience", slug) : role.item.url;

          return (
            <li
              key={`${role.item.company}-${role.item.title}`}
              id={role.anchor}
              className="scroll-mt-6"
            >
              <Entry role={role} href={href} internal={here} />
            </li>
          );
        })}
      </ol>
    </div>
  );
}
