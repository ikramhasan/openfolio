import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  note?: string;
  aside?: ReactNode;
  children: ReactNode;
};

/**
 * The frame around one tab's content: heading, optional gloss, then the content.
 *
 * There is no number in the margin. The rail already numbers every tab, and with
 * one section visible at a time a second copy beside the heading only indents the
 * whole panel by a column it does not need — so the content runs the full width
 * instead.
 *
 * No `id` either: the URL hash names the *tab*, and an element carrying the same
 * id would make the browser scroll to it on load, jumping the masthead out of
 * view. The heading is labelled by `aria-labelledby` from the tab button
 * instead, wired up in `tabs.tsx`, so the panel and its control are a pair.
 *
 * The heading is repeated here even though the rail already names the section.
 * The rail is a control; this is the document. Without it a panel read on its
 * own — via a deep link, or by a screen reader that has moved past the tablist —
 * would open on an unlabelled list.
 */
export function Panel({ title, note, aside, children }: PanelProps) {
  return (
    <div className="pf-rule border-t pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="pf-section-title">{title}</h2>
        {aside}
      </div>

      {note ? <p className="pf-meta mt-1">{note}</p> : null}

      <div className="mt-6">{children}</div>
    </div>
  );
}
