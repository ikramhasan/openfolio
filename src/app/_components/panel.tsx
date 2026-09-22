import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  note?: string;
  aside?: ReactNode;
  children: ReactNode;
};

/** The frame around one section: heading, optional gloss, then the content. */
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
