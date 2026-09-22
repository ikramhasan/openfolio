"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { compactRange, type Portfolio, shortCompany } from "./data";

type Role = Portfolio["sections"]["experience"]["items"][number];

/** Past this many pixels below the chip, downward is always fine. */
const MIN_ROOM_BELOW = 220;
/** Above must beat below by this much to be worth flipping for. */
const FLIP_MARGIN = 80;
/**
 * Kept clear of the viewport edges when the panel is nudged back on screen.
 *
 * Wide enough to cover the panel's shadow as well as its box: the shadow spreads
 * about 18px sideways and counts toward the document's scrollable width, though
 * `offsetWidth` does not report it. A gutter sized to the box alone left a few
 * pixels of horizontal scroll on a narrow screen.
 */
const EDGE_GUTTER = 22;

/*
 * Which side to open on, decided at the moment of opening: the panel is anchored
 * to the chip and travels with it, so there is nothing to recompute on scroll.
 *
 * Downward is the default and the bar for overriding it is deliberately high.
 * Opening upward covers the sentence the reader just read, whereas a panel that
 * runs past the bottom of the window only costs a scroll. So it flips only when
 * the room below is genuinely tight *and* above is clearly roomier — not merely a
 * pixel roomier, which is what a plain "does it fit below" test would do.
 */
function opensAbove(chip: DOMRect, panelHeight: number): boolean {
  const below = window.innerHeight - chip.bottom;
  const above = chip.top;

  if (below >= Math.min(panelHeight + 16, MIN_ROOM_BELOW)) return false;
  return above > below + FLIP_MARGIN;
}

/*
 * How far to pull the panel back horizontally.
 *
 * The panel is anchored to the chip's left edge, so a chip sitting late in a line
 * would otherwise hang off the right of the screen — and because the panel is a
 * positioned descendant, overhanging widens the document and the page gains a
 * horizontal scrollbar. That is a layout shift by another name, so it is measured
 * and corrected rather than left to `overflow`.
 *
 * Returned as a negative pixel offset, applied as a custom property. Never
 * positive: nothing needs pushing right, since the chip is never off-screen left.
 */
function edgeCorrection(chip: DOMRect, panelWidth: number): number {
  const overhang = chip.left + panelWidth + EDGE_GUTTER - window.innerWidth;
  if (overhang <= 0) return 0;

  // Never pull it so far that it starts before the gutter on the other side.
  return -Math.min(overhang, Math.max(0, chip.left - EDGE_GUTTER));
}

/**
 * A company named in the summary, opening onto the detail of the role there.
 *
 * The chip is an inline `<button>` so the prose reads as a sentence with a few
 * raised names in it, rather than as a list of controls. Clicking it reveals the
 * role, the dates and what was actually built there — the same facts the
 * Experience section carries, reachable from the sentence that mentions them.
 *
 * NO LAYOUT SHIFT is the constraint that shapes the rest. The detail is
 * positioned `absolute` against the chip, so it is out of flow: opening one
 * cannot move the paragraph it sits in, or anything below it. Nothing about the
 * surrounding text changes as it opens.
 *
 * The panel stays mounted and is hidden with `inert` plus a transition on opacity
 * and transform, rather than being added and removed. That is what gives a
 * symmetric open and close animation for free, keeps every company's detail in the
 * HTML for crawlers and in-page search, and avoids a mount flash. `inert` is what
 * keeps a closed panel out of the tab order and away from screen readers, which
 * `hidden`-less visual hiding would not do.
 */

export function CompanyChip({ role }: { role: Role }) {
  const panelId = useId();
  const years = compactRange(role.dateRange);
  const [open, setOpen] = useState(false);
  /** Flipped above the chip when there is not room beneath it. */
  const [above, setAbove] = useState(false);
  /** Horizontal nudge that keeps the panel inside the viewport. */
  const [shift, setShift] = useState(0);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);

  /*
   * Keep the panel inside the viewport, open or not.
   *
   * A closed panel is `visibility: hidden`, which still occupies its position and
   * still counts toward the document's scrollable width — so an uncorrected one
   * anchored near the right edge gives the whole page a horizontal scrollbar
   * before anybody clicks anything. Measuring only on open was not enough.
   *
   * Recomputed on resize, and on the reflows that move a chip within its
   * paragraph, since the correction depends on where the chip ended up.
   */
  useEffect(() => {
    const chipEl = buttonRef.current;
    const panel = panelRef.current;
    if (!chipEl || !panel) return;

    const measure = () => {
      setShift(
        edgeCorrection(chipEl.getBoundingClientRect(), panel.offsetWidth),
      );
    };

    measure();

    const observer = new ResizeObserver(measure);
    observer.observe(document.body);
    return () => observer.disconnect();
  }, []);

  /*
   * Dismissal. Pointer-down rather than click, so dragging to select text
   * elsewhere closes it without waiting for the release. Escape returns focus to
   * the chip, since that is where the reader was.
   */
  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  /** Chooses a side, then opens. The horizontal clamp is kept current already. */
  function toggle() {
    if (!open) {
      const chip = buttonRef.current?.getBoundingClientRect();
      const panel = panelRef.current;

      if (chip && panel) {
        setAbove(opensAbove(chip, panel.scrollHeight));
        setShift(edgeCorrection(chip, panel.offsetWidth));
      }
    }

    setOpen((was) => !was);
  }

  return (
    <span ref={wrapRef} className="pf-chip-wrap">
      <button
        ref={buttonRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        data-open={open}
        className="pf-chip"
      >
        {/* Decorative: the company name follows immediately as text. */}
        <span className="pf-chip-mark">
          <Image
            src={role.logo}
            alt=""
            width={32}
            height={32}
            sizes="16px"
            className="size-full object-contain"
          />
        </span>
        {/* Shortened; the panel below carries the company's full name. */}
        {shortCompany(role.company)}
      </button>

      {/*
        No `role` and no label of its own. The panel is prose, not a grouping of
        controls, and it is already announced through the chip's `aria-expanded`
        and `aria-controls` — which is also what names it, since the chip is the
        company. A bare `<span>` cannot carry `aria-labelledby` anyway.
      */}
      <span
        ref={panelRef}
        id={panelId}
        data-open={open}
        data-above={above}
        inert={!open}
        style={{ "--pf-chip-shift": `${shift}px` } as React.CSSProperties}
        className="pf-chip-panel"
      >
        <span className="pf-chip-panel-inner">
          {/*
            Four lines, and deliberately no bullets. The Experience section is
            where the detail of a role belongs; this only has to answer "what was
            this, and when" without making the reader leave the sentence. Every
            bullet reprinted here made the panel taller than the paragraph behind
            it.
          */}
          <span className="flex items-start gap-2.5">
            <span className="pf-chip-panel-mark">
              <Image
                src={role.logo}
                alt=""
                width={64}
                height={64}
                sizes="28px"
                className="size-full object-contain"
              />
            </span>

            <span className="block min-w-0">
              <span className="pf-title pf-strong block">{role.title}</span>
              <span className="pf-meta mt-0.5 block">{role.company}</span>
            </span>
          </span>

          <span className="pf-meta mt-2.5 flex flex-wrap items-baseline gap-x-2">
            <span className="pf-figure">{years}</span>
            <span className="pf-faint" aria-hidden="true">
              ·
            </span>
            <span>{role.location.trim()}</span>
          </span>

          {role.url ? (
            <a
              href={role.url}
              target="_blank"
              rel="noreferrer"
              className="pf-link-quiet pf-meta mt-2 inline-block"
            >
              {new URL(role.url).hostname.replace(/^www\./, "")} ↗
            </a>
          ) : null}
        </span>
      </span>
    </span>
  );
}
