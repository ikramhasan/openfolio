import { notFound } from "next/navigation";
import { Panel } from "../../../_components/panel";
import { GroupEditor } from "../../_components/group-editor";
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

  return (
    <Panel title={group.title} note={group.note}>
      <GroupEditor blocks={group.blocks} aboutBio={aboutBio} />
    </Panel>
  );
}
