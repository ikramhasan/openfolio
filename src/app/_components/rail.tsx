"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * The index rail.
 *
 * Two shapes, one list. From `lg` it is the sticky vertical index beside the
 * content. Below that it is a sticky horizontal strip pinned to the top of the
 * viewport: nine stacked items ahead of the masthead pushed the actual content
 * most of a phone screen down, so on a narrow viewport the rail lies on its side
 * and scrolls sideways instead. It stays reachable at any scroll depth, which the
 * vertical list only managed at the very top of the page.
 *
 * The positional numbers are dropped below `lg`. They are decorative, and nine of
 * them roughly doubles the width of a strip that has to fit across a phone.
 *
 * Each section is a route, so every item is a real link: middle-click, cmd-click,
 * right-click-copy-address and the browser's own back button all work without this
 * component knowing about any of them. Keyboard support is whatever links already
 * do, so there is no key handling to write.
 *
 * `prefetch` is left at its default: the panels are small and adjacent sections
 * are the likely next click, so letting Next warm them keeps switching instant.
 */

type NavItem = {
  href: string;
  label: string;
  /** Positional number, shown from `lg` where there is room for it. */
  index: string;
};

/** Past this many pixels a pointer gesture is a scroll, not a click. */
const DRAG_THRESHOLD = 6;

export function Rail({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const scrollerRef = useRef<HTMLUListElement>(null);
  /** Distinguishes first paint from a later navigation. */
  const mountedRef = useRef(false);

  /*
   * Bring the current item into view in the horizontal strip. Landing on
   * `/references` with the strip scrolled to the start would otherwise give no
   * sign of which section is showing.
   *
   * The scroller is nudged with `scrollBy` rather than the item with
   * `scrollIntoView`: the latter would also scroll the page vertically, undoing
   * the scroll reset that makes a fresh section start at its heading. Skipped
   * entirely when the list is not overflowing, which is the vertical layout.
   */
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

  /*
   * Drag to scroll, and the fades that say the strip scrolls at all.
   *
   * Touch already pans an overflow container, so this exists for mouse and pen,
   * where a horizontal scroller is otherwise only reachable with a trackpad
   * swipe or a shift-wheel. The items are links, and dragging a link starts the
   * browser's own link-drag — `draggable={false}` below is what frees the gesture
   * for scrolling.
   *
   * A drag that travelled past the threshold swallows the click that ends it, so
   * pulling the strip along by an item does not also navigate to it. The listener
   * is in the capture phase: React delegates from the document root, so stopping
   * propagation here is what keeps `Link` from handling it.
   *
   * State is written to data attributes rather than React state. It changes on
   * every scroll frame and only CSS and this effect read it, so a re-render per
   * frame would buy nothing.
   */
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    /**
     * Marks the edges that have more content past them.
     *
     * Guarded on the layout, not just on overflow: the vertical rail is a column
     * whose widest item can still exceed the track, which would otherwise light
     * up the fade and the grab cursor on a list that does not scroll.
     */
    const paint = () => {
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
    /** True once the gesture has been claimed as a scroll. */
    let dragging = false;
    /** Set on the pointerup that ended a drag; read by the click that follows. */
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

      /*
       * Capture is taken here rather than on pointerdown, and only once the
       * gesture is unambiguously a scroll. Capturing retargets every later event
       * in the gesture — the closing `click` included — to the scroller, so
       * capturing up front left the click on the `<ul>` and the link was never
       * followed.
       */
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

    // Catches the breakpoint flip between the two layouts, and font loading.
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
      {/* No heading. The masthead's `h1` names the site a column away on `lg` and
          directly below on a narrow viewport, so a second copy here was only
          pushing the first section down. */}
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
                  /* Frees the drag gesture for scrolling: without this the
                     browser drags the link itself, ghost image and all. */
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
