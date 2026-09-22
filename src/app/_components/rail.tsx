"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * The index rail: a sticky vertical list from `lg`, a horizontal scrolling strip
 * below that.
 */

type NavItem = {
  href: string;
  label: string;
  index: string;
};

const DRAG_THRESHOLD = 6;

export function Rail({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const scrollerRef = useRef<HTMLUListElement>(null);
  const mountedRef = useRef(false);

  // Centre the current item in the strip. `scrollBy` on the scroller rather than
  // `scrollIntoView` on the item, which would also scroll the page vertically.
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
    const delta = item.left - box.left - (box.width - item.width) / 2;

    const instant =
      !mountedRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    scroller.scrollBy({ left: delta, behavior: instant ? "auto" : "smooth" });
    mountedRef.current = true;
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
    <div className="pf-rule sticky top-0 z-20 -mx-6 min-w-0 border-b bg-[var(--pf-bg)] px-6 py-2 sm:-mx-10 sm:px-10 lg:mx-0 lg:h-screen lg:self-start lg:border-b-0 lg:px-0 lg:pt-16 lg:pb-0">
      <nav aria-label="Portfolio sections">
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
                  className="pf-tab pf-meta shrink-0 whitespace-nowrap px-2.5 py-1 lg:-mx-2 lg:flex lg:items-baseline lg:gap-2.5 lg:px-2"
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
    </div>
  );
}
