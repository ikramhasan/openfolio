"use client";

import { HideToggle } from "./hide-toggle";

export function SectionToggle({
  section,
  label,
}: {
  section: string;
  label: string;
}) {
  return (
    <HideToggle
      path={`sections.${section}.hidden`}
      label={`the ${label.toLowerCase()} section`}
    />
  );
}
