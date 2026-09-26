import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getIntro } from "../_components/content";
import { CvViewer } from "../_components/cv-viewer";

export async function generateMetadata(): Promise<Metadata> {
  const intro = await getIntro();

  if (!intro.resume) return { robots: { index: false, follow: false } };

  return {
    title: "CV",
    description: `The curriculum vitae of ${intro.title}.`,
    alternates: { canonical: "/cv" },
  };
}

export default async function CvPage() {
  const intro = await getIntro();

  if (!intro.resume) notFound();

  return <CvViewer owner={intro.title} />;
}
