import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  note?: string;
  aside?: ReactNode;
  children: ReactNode;
};

/**
 * The frame around one section's content: heading, optional gloss, then the
 * content.
 *
 * There is no number in the margin. The rail already numbers every section, and
 * with one section per page a second copy beside the heading only indents the
 * whole panel by a column it does not need — so the content runs the full width
 * instead.
 *
 * The heading is repeated here even though the rail already names the section.
 * The rail is a control; this is the document. Without it a section would open on
 * an unlabelled list for anyone arriving by direct link or reading past the nav.
 *
 * The fade is on the outer element, so it plays once per navigation and confirms
 * the change without animating layout — the same reassurance the in-page panel
 * swap used to give.
 */
export function Panel({ title, note, aside, children }: PanelProps) {
  return (
    <div className="pf-rule pf-panel-enter border-t pt-6">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 className="pf-section-title">{title}</h2>
        {aside}
      </div>

      {note ? <p className="pf-meta mt-1">{note}</p> : null}

      <div className="mt-6">{children}</div>
    </div>
  );
}
