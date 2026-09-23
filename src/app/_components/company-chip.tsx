"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { compactRange, shortCompany } from "./data";
import type { Role } from "./types";

const MIN_ROOM_BELOW = 220;
const FLIP_MARGIN = 80;
const EDGE_GUTTER = 22;

function opensAbove(chip: DOMRect, panelHeight: number): boolean {
  const below = window.innerHeight - chip.bottom;
  const above = chip.top;

  if (below >= Math.min(panelHeight + 16, MIN_ROOM_BELOW)) return false;
  return above > below + FLIP_MARGIN;
}

function edgeCorrection(chip: DOMRect, panelWidth: number): number {
  const overhang = chip.left + panelWidth + EDGE_GUTTER - window.innerWidth;
  if (overhang <= 0) return 0;

  return -Math.min(overhang, Math.max(0, chip.left - EDGE_GUTTER));
}

export function CompanyChip({ role }: { role: Role }) {
  const panelId = useId();
  const years = compactRange(role.dateRange);
  const [open, setOpen] = useState(false);
  const [above, setAbove] = useState(false);
  const [shift, setShift] = useState(0);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLSpanElement>(null);

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
        <span className="pf-chip-mark">
          {role.logo ? (
            <Image
              src={role.logo}
              alt=""
              width={32}
              height={32}
              sizes="16px"
              className="size-full object-contain"
            />
          ) : null}
        </span>
        {shortCompany(role.company)}
      </button>

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
          <span className="flex items-start gap-2.5">
            <span className="pf-chip-panel-mark">
              {role.logo ? (
                <Image
                  src={role.logo}
                  alt=""
                  width={64}
                  height={64}
                  sizes="28px"
                  className="size-full object-contain"
                />
              ) : null}
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
