import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIntro } from "../_components/content";
import { CvViewer } from "../_components/cv-viewer";
import { pageMetadata } from "../_components/seo";

export async function generateMetadata(): Promise<Metadata> {
  const intro = await getIntro();

  if (!intro.resume) return { robots: { index: false, follow: false } };

  return pageMetadata({
    title: "CV",
    description: `The curriculum vitae of ${intro.title}. ${intro.bio}`,
    path: "/cv",
    type: "profile",
  });
}

export default async function CvPage() {
  const intro = await getIntro();

  if (!intro.resume) notFound();

  return <CvViewer owner={intro.title} />;
}
