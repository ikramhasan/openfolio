import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  embedLimit,
  isEmbeddableSection,
} from "@/components/editor/plugins/section-embed-base-plugin";
import { SectionEmbed } from "../../../../_components/section-embed";

export default async function SectionPreviewPage({
  params,
}: PageProps<"/admin/preview/[section]/[limit]">) {
  await connection();
  const { section, limit } = await params;

  if (!isEmbeddableSection(section)) notFound();

  return (
    <main data-section-preview className="px-px pb-1">
      <SectionEmbed section={section} limit={embedLimit(Number(limit))} />
    </main>
  );
}
