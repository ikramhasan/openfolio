import { notFound } from "next/navigation";
import { getIntro } from "../_components/content";

export async function resumeResponse(
  disposition: "inline" | "attachment",
): Promise<Response> {
  const intro = await getIntro();
  if (!intro.resume) notFound();

  const upstream = await fetch(intro.resume, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) notFound();

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${filename(intro.title)}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
    },
  });
}

function filename(title: string): string {
  const cleaned = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${cleaned || "resume"}-cv.pdf`;
}
