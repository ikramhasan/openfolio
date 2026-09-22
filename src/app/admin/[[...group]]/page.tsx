import { notFound } from "next/navigation";
import { Panel } from "../../_components/panel";
import { GroupEditor } from "../_components/group-editor";
import { ADMIN_GROUPS, groupByPath, groupSegments } from "../_lib/schema";

/**
 * One group per route, the same shape as the site's sections: `/admin` is the first
 * group, then `/admin/experience` and the rest. The schema is the list.
 *
 * The layout reads the session, so nothing here is prerendered; `generateStaticParams`
 * is kept only so the route's paths are known at build time.
 */

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

  return (
    <Panel title={group.title} note={group.note}>
      <GroupEditor blocks={group.blocks} />
    </Panel>
  );
}
