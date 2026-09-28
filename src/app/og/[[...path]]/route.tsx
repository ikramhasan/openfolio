import { renderHomeCard, renderPageCard } from "../../_components/og-image";
import { routedSections, sectionForPath } from "../../_components/sections";

export async function generateStaticParams() {
  const sections = await routedSections();

  return sections.map((entry) => ({
    path: entry.home ? [] : entry.path.slice(1).split("/"),
  }));
}

export async function GET(
  _request: Request,
  { params }: RouteContext<"/og/[[...path]]">,
) {
  const { path } = await params;
  const entry = await sectionForPath(`/${(path ?? []).join("/")}`);

  if (!entry) return new Response("Not found", { status: 404 });

  if (entry.home) return renderHomeCard();

  return renderPageCard({
    title: entry.title,
    standfirst: entry.note,
    path: entry.path,
  });
}
