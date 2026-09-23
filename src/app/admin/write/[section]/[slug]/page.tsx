import { notFound } from "next/navigation";
import { isWritableSection, readPath } from "../../../../_components/writing";
import { BodyEditor } from "../../../_components/body-editor";
import { loadBody } from "../../../_lib/repository";
import { ADMIN_GROUPS, groupPath } from "../../../_lib/schema";

/**
 * One record's body, at the section and slug its record carries. Outside the
 * `(content)` group, so it carries none of the groups' furniture and does not load a
 * draft of the whole portfolio to write one page.
 *
 * The record — its title, dates, images — stays in its group; this page is only the
 * prose. Nothing is prerendered: the layout has already read the session.
 */
export default async function WritePage({
  params,
}: PageProps<"/admin/write/[section]/[slug]">) {
  const { section, slug } = await params;

  // A section with no body table has nothing to write, and the section is a URL
  // segment until it has been checked against the four that have one.
  if (!isWritableSection(section)) notFound();

  const record = await loadBody(section, slug);
  if (!record) notFound();

  // Every writable section is also an editing group, under its own id.
  const group = ADMIN_GROUPS.find((entry) => entry.id === section);

  return (
    <BodyEditor
      section={section}
      slug={slug}
      title={record.title}
      body={record.body}
      back={{
        href: group ? groupPath(group) : "/admin",
        label: group?.label ?? "Admin",
      }}
      readPath={readPath(section, slug)}
    />
  );
}
