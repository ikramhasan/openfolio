import { notFound } from "next/navigation";
import { Panel } from "../../../_components/panel";
import { GroupEditor } from "../../_components/group-editor";
import { SectionToggle } from "../../_components/section-toggle";
import { loadAboutBio } from "../../_lib/repository";
import { ADMIN_GROUPS, groupByPath, groupSegments } from "../../_lib/schema";

export function generateStaticParams() {
  return ADMIN_GROUPS.map((group) => ({ group: groupSegments(group) }));
}

function pathOf(segments: string[] | undefined): string {
  return ["/admin", ...(segments ?? [])].join("/");
}

export default async function AdminGroupPage({
  params,
}: PageProps<"/admin/[[...group]]">) {
  const { group: segments } = await params;
  const group = groupByPath.get(pathOf(segments));

  if (!group) notFound();

  const aboutBio = group.blocks.some((block) => block.kind === "richText")
    ? await loadAboutBio()
    : null;

  const toggled = group.blocks.find(
    (block) => block.kind === "fields" && block.sectionToggle,
  );

  const sectionToggle =
    toggled && toggled.kind === "fields" ? toggled.sectionToggle : undefined;

  return (
    <Panel
      title={group.title}
      note={group.note}
      aside={
        sectionToggle ? (
          <SectionToggle section={sectionToggle} label={group.title} />
        ) : undefined
      }
    >
      <GroupEditor blocks={group.blocks} aboutBio={aboutBio} />
    </Panel>
  );
}
