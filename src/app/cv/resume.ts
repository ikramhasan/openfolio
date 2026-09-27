import { connection } from "next/server";
import { getIntro } from "../_components/content";

export async function resumeResponse(
  disposition: "inline" | "attachment",
): Promise<Response> {
  await connection();

  const intro = await getIntro();
  if (!intro.resume) return missing();

  const upstream = await fetch(intro.resume, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) return missing();

  return new Response(upstream.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${filename(intro.title)}"`,
      "Cache-Control": "private, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function missing(): Response {
  return new Response("Not found", {
    status: 404,
    headers: { "Cache-Control": "no-store" },
  });
}

function filename(title: string): string {
  const cleaned = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return `${cleaned || "resume"}-cv.pdf`;
}
