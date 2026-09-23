"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ThemeToggle } from "./theme-toggle";

/**
 * The index rail: a sticky vertical list from `lg`, a horizontal scrolling strip
 * below that. Shared by the portfolio and `/admin`.
 */

type NavItem = {
  href: string;
  label: string;
  index: string;
};

const DRAG_THRESHOLD = 6;

/** The strip's edge fade, `--pf-rail` in `globals.css`: 2.5rem either side. */
const FADE = 40;

export function Rail({
  items,
  label = "Portfolio sections",
}: {
  items: NavItem[];
  label?: string;
}) {
  const pathname = usePathname();
  const scrollerRef = useRef<HTMLUListElement>(null);
  const mountedRef = useRef(false);

  // Reveal the current item. Centred on the first render, which is what arriving
  // at a section's URL wants; after that the strip stays where it was scrolled to
  // and the item is only nudged clear of an edge fade — re-centring on every tap
  // throws away the scroll the reader just made to reach the tab.
  // `scrollBy` on the scroller rather than `scrollIntoView` on the item, which
  // would also scroll the page vertically.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    if (scroller.scrollWidth <= scroller.clientWidth) return;

    const active = scroller.querySelector<HTMLElement>(
      `[data-rail-href="${CSS.escape(pathname)}"]`,
    );
    if (!active) return;

    const box = scroller.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    const first = !mountedRef.current;
    mountedRef.current = true;

    let delta: number;
    if (first) {
      delta = item.left - box.left - (box.width - item.width) / 2;
    } else {
      const under = Math.min(item.left - box.left - FADE, 0);
      const over = Math.max(item.right - (box.right - FADE), 0);
      // Both only when the item is wider than the unfaded track; align its start.
      delta = under < 0 ? under : over;
      if (delta === 0) return;
    }

    const instant =
      first || window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    scroller.scrollBy({ left: delta, behavior: instant ? "auto" : "smooth" });
  }, [pathname]);

  // Drag to scroll, for pointers that cannot swipe, plus the edge fades.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const paint = () => {
      // Guarded on layout, not just overflow: the vertical column's widest item
      // can exceed its track without the list scrolling.
      const horizontal =
        getComputedStyle(scroller).flexDirection === "row" &&
        scroller.scrollWidth - scroller.clientWidth > 1;

      if (!horizontal) {
        delete scroller.dataset.scrollable;
        delete scroller.dataset.fade;
        return;
      }

      const max = scroller.scrollWidth - scroller.clientWidth;
      const atStart = scroller.scrollLeft <= 1;
      const atEnd = scroller.scrollLeft >= max - 1;

      scroller.dataset.scrollable = "true";
      scroller.dataset.fade = atStart ? "right" : atEnd ? "left" : "both";
    };

    let pointerId: number | null = null;
    let originX = 0;
    let originScroll = 0;
    let travelled = 0;
    let dragging = false;
    let swallowClick = false;

    const onPointerDown = (event: PointerEvent) => {
      swallowClick = false;
      if (event.pointerType === "touch" || event.button !== 0) return;
      if (scroller.dataset.scrollable !== "true") return;

      pointerId = event.pointerId;
      originX = event.clientX;
      originScroll = scroller.scrollLeft;
      travelled = 0;
      dragging = false;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;

      const dx = event.clientX - originX;
      travelled = Math.max(travelled, Math.abs(dx));

      // Capture only once the gesture is definitely a scroll. Taking it on
      // pointerdown retargets the closing `click` to the `<ul>`, so the link
      // never fires.
      if (!dragging) {
        if (travelled <= DRAG_THRESHOLD) return;
        dragging = true;
        scroller.setPointerCapture(event.pointerId);
        scroller.dataset.dragging = "true";
      }

      scroller.scrollLeft = originScroll - dx;
      event.preventDefault();
    };

    const onPointerUp = (event: PointerEvent) => {
      if (pointerId !== event.pointerId) return;

      pointerId = null;
      swallowClick = dragging;
      dragging = false;
      delete scroller.dataset.dragging;
    };

    // Capture phase, so a drag's closing click never reaches `Link`.
    const onClick = (event: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      event.preventDefault();
      event.stopPropagation();
    };

    paint();
    scroller.addEventListener("scroll", paint, { passive: true });
    scroller.addEventListener("pointerdown", onPointerDown);
    scroller.addEventListener("pointermove", onPointerMove);
    scroller.addEventListener("pointerup", onPointerUp);
    scroller.addEventListener("pointercancel", onPointerUp);
    scroller.addEventListener("click", onClick, { capture: true });

    const observer = new ResizeObserver(paint);
    observer.observe(scroller);

    return () => {
      scroller.removeEventListener("scroll", paint);
      scroller.removeEventListener("pointerdown", onPointerDown);
      scroller.removeEventListener("pointermove", onPointerMove);
      scroller.removeEventListener("pointerup", onPointerUp);
      scroller.removeEventListener("pointercancel", onPointerUp);
      scroller.removeEventListener("click", onClick, { capture: true });
      observer.disconnect();
    };
  }, []);

  return (
    <div className="pf-rule sticky top-0 z-20 -mx-6 flex min-w-0 items-center gap-4 border-b bg-[var(--pf-bg)] px-6 py-0.5 sm:-mx-10 sm:px-10 lg:mx-0 lg:h-screen lg:flex-col lg:items-stretch lg:gap-0 lg:self-start lg:border-b-0 lg:px-0 lg:pt-16 lg:pb-8">
      <nav aria-label={label} className="min-w-0 flex-1 lg:flex-none">
        <ul
          ref={scrollerRef}
          className="pf-rail flex gap-1 overflow-x-auto lg:flex-col lg:gap-0.5 lg:overflow-x-visible"
        >
          {items.map((item) => {
            const active = item.href === pathname;

            return (
              <li key={item.href} className="contents">
                <Link
                  href={item.href}
                  // Without this the browser drags the link instead of scrolling.
                  draggable={false}
                  data-rail-href={item.href}
                  data-active={active}
                  aria-current={active ? "page" : undefined}
                  className="pf-tab pf-meta shrink-0 whitespace-nowrap px-2.5 lg:-mx-2 lg:flex lg:items-baseline lg:gap-2.5 lg:px-2"
                >
                  <span
                    aria-hidden="true"
                    className="pf-faint pf-figure hidden lg:inline"
                  >
                    {item.index}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 lg:mt-auto lg:-ml-0.5">
        <ThemeToggle />
      </div>
    </div>
  );
}
