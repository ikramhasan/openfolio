"use client";

import { useEffect, useState } from "react";

/** Shared with the inline script in `layout.tsx`. Changing one means both. */
export const THEME_STORAGE_KEY = "pf-theme";

const ORDER = ["system", "light", "dark"] as const;

type Theme = (typeof ORDER)[number];

const LABEL: Record<Theme, string> = {
  system: "Auto",
  light: "Light",
  dark: "Dark",
};

const NEXT: Record<Theme, Theme> = {
  system: "light",
  light: "dark",
  dark: "system",
};

function Icon({ value }: { value: Theme }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      data-value={value}
      className="pf-theme-icon"
    >
      {value === "system" ? (
        <>
          <circle cx="8" cy="8" r="5.6" />
          <path
            d="M8 2.4a5.6 5.6 0 0 0 0 11.2z"
            fill="currentColor"
            stroke="none"
          />
        </>
      ) : null}
      {value === "light" ? (
        <>
          <circle cx="8" cy="8" r="3.1" />
          <path d="M8 1.2v1.4M8 13.4v1.4M1.2 8h1.4M13.4 8h1.4M3.2 3.2l1 1M11.8 11.8l1 1M12.8 3.2l-1 1M4.2 11.8l-1 1" />
        </>
      ) : null}
      {value === "dark" ? (
        <path d="M13.2 10.1A5.8 5.8 0 0 1 5.9 2.8a5.8 5.8 0 1 0 7.3 7.3z" />
      ) : null}
    </svg>
  );
}

/** Follow the system, or pin light or dark. Three labels from `lg`, a cycling
 *  icon button below that, where the rail has no room to spare. */
export function ThemeToggle() {
  // Only feeds the controls' own state. The visible selection is a CSS match on
  // `<html data-theme>`, which is already right at the first paint.
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const applied = document.documentElement.dataset.theme;
    setTheme(applied === "light" || applied === "dark" ? applied : "system");
  }, []);

  function choose(next: Theme) {
    setTheme(next);

    if (next === "system") {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = next;
    }

    try {
      if (next === "system") {
        localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      }
    } catch {
      // Private modes can refuse storage; the choice still holds for this visit.
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => choose(NEXT[theme])}
        aria-label={`Theme: ${LABEL[theme]}. Switch to ${LABEL[NEXT[theme]]}.`}
        className="pf-theme-button inline-flex lg:hidden"
      >
        {ORDER.map((value) => (
          <Icon key={value} value={value} />
        ))}
      </button>

      {/* Real radios, for arrow keys and a single tab stop at no cost. */}
      <fieldset className="pf-theme hidden lg:inline-flex">
        <legend className="sr-only">Theme</legend>

        {ORDER.map((value) => (
          <label key={value} data-value={value} className="pf-theme-option">
            <input
              type="radio"
              name="pf-theme"
              value={value}
              checked={theme === value}
              onChange={() => choose(value)}
              className="pf-theme-input"
            />
            {LABEL[value]}
          </label>
        ))}
      </fieldset>
    </>
  );
}
