import { notFound } from "next/navigation";
import { ArticleEditor } from "../../_components/article-editor";
import { loadArticle } from "../../_lib/repository";

/**
 * One post's body, at the slug its record carries. A static segment, so it takes
 * `/admin/articles/<slug>` from the group catch-all while `/admin/articles` still
 * answers with the Articles group.
 *
 * The record — title, slug, dates, cover — stays in that group; this page is only
 * the prose. Nothing is prerendered: the layout has already read the session.
 */
export default async function AdminArticlePage({
  params,
}: PageProps<"/admin/articles/[slug]">) {
  const { slug } = await params;
  const article = await loadArticle(slug);

  if (!article) notFound();

  return (
    <ArticleEditor
      slug={article.slug}
      title={article.title}
      body={article.body}
    />
  );
}
