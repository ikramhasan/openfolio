"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * The sticky index rail.
 *
 * Each section is a route, so every item here is a real link: middle-click,
 * cmd-click, right-click-copy-address and the browser's own back button all work
 * without this component knowing about any of them. Keyboard support is whatever
 * links already do, so there is no key handling to write.
 *
 * The only reason this is a client component is `usePathname`, needed to mark the
 * current item. Nothing else in the shell ships to the browser.
 *
 * `prefetch` is left at its default: the panels are small and adjacent sections
 * are the likely next click, so letting Next warm them keeps switching instant —
 * which is what the previous in-page tab swap gave for free.
 */

type NavItem = {
  href: string;
  label: string;
  /** Positional number shown in the rail. */
  index: string;
};

export function Rail({
  items,
  name,
}: {
  items: NavItem[];
  /** Sits at the top of the rail. */
  name: string;
}) {
  const pathname = usePathname();

  return (
    <div className="pt-10 lg:sticky lg:top-0 lg:h-screen lg:self-start lg:pt-16">
      <p className="pf-title pf-strong">{name}</p>

      <nav aria-label="Portfolio sections" className="mt-6">
        <ul className="flex flex-col gap-0.5">
          {items.map((item) => {
            const active = item.href === pathname;

            return (
              <li key={item.href} className="contents">
                <Link
                  href={item.href}
                  data-active={active}
                  aria-current={active ? "page" : undefined}
                  className="pf-tab pf-meta -mx-2 flex items-baseline gap-2.5 px-2 py-1"
                >
                  <span aria-hidden="true" className="pf-faint pf-figure">
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
