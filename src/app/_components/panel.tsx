import type { ReactNode } from "react";

type PanelProps = {
  title: string;
  note?: string;
  aside?: ReactNode;
  lead?: boolean;
  children: ReactNode;
};

export function Panel({ title, note, aside, lead, children }: PanelProps) {
  if (lead) {
    return (
      <section className="pf-rule pf-panel-enter border-t pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 className="pf-section-title">{title}</h2>
          {aside}
        </div>

        {note ? <p className="pf-meta mt-1">{note}</p> : null}

        <div className="mt-6">{children}</div>
      </section>
    );
  }

  return (
    <section className="pf-panel-enter pt-8 lg:pt-14 xl:pt-16">
      <header>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <h1 className="pf-page-title">{title}</h1>
          {aside}
        </div>

        {note ? (
          <p className="pf-page-standfirst mt-3 max-w-[52ch]">{note}</p>
        ) : null}
      </header>

      <div className="pf-rule mt-7 border-t pt-7">{children}</div>
    </section>
  );
}
