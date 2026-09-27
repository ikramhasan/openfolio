import type { ReactNode, Ref } from "react";

export function GroupHeader({
  ref,
  id,
  title,
  count,
  note,
  actions,
  sticky = false,
}: {
  ref?: Ref<HTMLDivElement>;
  id?: string;
  title: string;
  count?: number;
  note?: ReactNode;
  actions?: ReactNode;
  sticky?: boolean;
}) {
  return (
    <div
      ref={ref}
      className={`pf-rule flex flex-wrap items-end justify-between gap-x-6 gap-y-3 border-b pb-3 ${sticky ? "pf-sticky-head" : ""}`}
    >
      <div className="min-w-0 flex-[1_1_16rem]">
        <h2 id={id} className="pf-section-title">
          {title}
          {count === undefined ? null : (
            <span className="pf-meta pf-figure pf-faint ml-2">{count}</span>
          )}
        </h2>

        {note ? <p className="pf-meta mt-1 max-w-[68ch]">{note}</p> : null}
      </div>

      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </div>
  );
}
