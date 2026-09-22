"use client";

import {
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

/**
 * The tab machinery.
 *
 * The sticky left rail is a `tablist`, and clicking an item swaps the content on
 * the right rather than scrolling to it. The active item is marked with the
 * rail's own hover tint, since a tabbed rail has to say which section is showing.
 *
 * This component owns the two-column grid because the rail and the panels are its
 * two columns and the state lives here. The masthead and footer are handed in as
 * `header` and `footer` so they keep their alignment inside the content column.
 *
 * Panels arrive as already-rendered `ReactNode`s from the server page, so the
 * section components stay server components and none of their code reaches the
 * browser. This file ships only the state, the keyboard handling and the URL
 * sync.
 *
 * Every panel stays in the DOM and inactive ones are `hidden`, rather than being
 * unmounted. That keeps the whole portfolio in the HTML for crawlers, in-page
 * search and printing, and makes switching instant. The panels are small enough
 * that the cost is negligible.
 */

type TabItem = {
  id: string;
  label: string;
  /** Positional number shown in the rail. */
  index: string;
};

export function Tabs({
  items,
  panels,
  defaultId,
  name,
  header,
  footer,
}: {
  items: TabItem[];
  /** One entry per tab, keyed by the same id. */
  panels: { id: string; node: ReactNode }[];
  defaultId: string;
  /** Sits at the top of the rail. */
  name: string;
  /** Masthead and strip, rendered above the panels in the content column. */
  header: ReactNode;
  footer: ReactNode;
}) {
  const baseId = useId();
  const [activeId, setActiveId] = useState(defaultId);
  const railRef = useRef<HTMLDivElement>(null);
  /** Suppresses the scroll-into-view on the very first paint. */
  const mountedRef = useRef(false);

  const tabId = (id: string) => `${baseId}-tab-${id}`;
  const panelId = (id: string) => `${baseId}-panel-${id}`;

  const isKnown = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items],
  );

  /*
   * Deep links. The hash is read once on mount — not during render, which would
   * mismatch the server's HTML — and again on back/forward.
   */
  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (id && isKnown(id)) setActiveId(id);
    };

    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [isKnown]);

  /*
   * Keep the URL shareable. `replaceState` rather than `pushState`: a tab is a
   * view of one page, and pushing would make the back button walk through every
   * tab the visitor happened to open before leaving the site.
   */
  useEffect(() => {
    if (!mountedRef.current) return;
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}#${activeId}`,
    );
  }, [activeId]);

  /*
   * Scroll the panel back up if the visitor had read down the previous one.
   * Switching tabs while halfway down a long list would otherwise land them in
   * the middle of the new one.
   */
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }

    const behavior = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? "auto"
      : "smooth";

    const panel = document.getElementById(panelId(activeId));
    if (panel && panel.getBoundingClientRect().top < 0) {
      panel.scrollIntoView({ block: "start", behavior });
    }
  });

  /** Arrow-key navigation, per the ARIA tabs pattern. */
  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const KEYS = [
      "ArrowRight",
      "ArrowDown",
      "ArrowLeft",
      "ArrowUp",
      "Home",
      "End",
    ];
    if (!KEYS.includes(event.key)) return;

    event.preventDefault();

    const current = items.findIndex((item) => item.id === activeId);
    const last = items.length - 1;

    // The rail is a vertical list, but both axes are accepted rather than
    // committing to one `aria-orientation`.
    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") {
      next = current === last ? 0 : current + 1;
    } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      next = current === 0 ? last : current - 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = last;
    }

    const target = items[next];
    if (!target) return;

    setActiveId(target.id);
    railRef.current
      ?.querySelector<HTMLElement>(`[data-tab-id="${target.id}"]`)
      ?.focus();
  }

  return (
    <div
      id="top"
      className="mx-auto grid w-full max-w-6xl flex-1 gap-x-16 px-6 sm:px-10 lg:grid-cols-[200px_minmax(0,1fr)]"
    >
      {/*
        Sticky from `lg`. Below that the rail stays put as a plain vertical list
        above the content: it is the only way to reach a section, so it can never
        be hidden.
      */}
      <div className="pt-10 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:pt-16">
        <p className="pf-title pf-strong">{name}</p>

        <div
          ref={railRef}
          role="tablist"
          aria-label="Portfolio sections"
          onKeyDown={handleKeyDown}
          className="mt-6 flex flex-col gap-0.5"
        >
          {items.map((item) => {
            const active = item.id === activeId;

            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={tabId(item.id)}
                data-tab-id={item.id}
                data-active={active}
                aria-selected={active}
                aria-controls={panelId(item.id)}
                tabIndex={active ? 0 : -1}
                onClick={() => setActiveId(item.id)}
                className="pf-tab pf-meta -mx-2 flex items-baseline gap-2.5 px-2 py-1"
              >
                <span aria-hidden="true" className="pf-faint pf-figure">
                  {item.index}
                </span>
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-w-0">
        {header}

        <main>
          {panels.map((panel) => {
            const active = panel.id === activeId;

            return (
              <div
                key={panel.id}
                role="tabpanel"
                id={panelId(panel.id)}
                aria-labelledby={tabId(panel.id)}
                hidden={!active}
                className={active ? "pf-panel-enter" : undefined}
              >
                {panel.node}
              </div>
            );
          })}
        </main>

        {footer}
      </div>
    </div>
  );
}
