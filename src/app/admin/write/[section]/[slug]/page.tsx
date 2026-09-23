import { notFound } from "next/navigation";
import { isWritableSection, readPath } from "../../../../_components/writing";
import { BodyEditor } from "../../../_components/body-editor";
import { loadBody } from "../../../_lib/repository";
import { ADMIN_GROUPS, groupPath } from "../../../_lib/schema";

export default async function WritePage({
  params,
}: PageProps<"/admin/write/[section]/[slug]">) {
  const { section, slug } = await params;

  if (!isWritableSection(section)) notFound();

  const record = await loadBody(section, slug);
  if (!record) notFound();

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
