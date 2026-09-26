"use client";

import { useDraft } from "../_lib/draft";
import { HideToggle } from "./hide-toggle";

export function SectionToggle({ section }: { section: string }) {
  const draft = useDraft();
  const title = String(draft.read(`sections.${section}.title`) ?? section);

  return (
    <HideToggle
      path={`sections.${section}.hidden`}
      label={`the ${title.toLowerCase()} section`}
    />
  );
}
