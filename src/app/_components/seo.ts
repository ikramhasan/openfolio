import "server-only";

import type { Metadata } from "next";
import { getIntro, getSite } from "./content";
import { siteUrl } from "./site-url";

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

export function ogImagePath(path: string): string {
  return path === "/" ? "/og" : `/og${path}`;
}

const DESCRIPTION_LENGTH = 160;
const LOCALE = "en_US";

export const FEED_PATH = "/feed.xml";

export function absolute(path: string): string {
  return path === "/" ? siteUrl : `${siteUrl}${path}`;
}

export function clip(text: string, max = DESCRIPTION_LENGTH): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;

  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.–—-]+$/, "")}…`;
}

type PlateNode = { text?: string; children?: PlateNode[]; type?: string };

const SKIPPED_BLOCKS = new Set(["code_block", "equation", "toc", "img"]);

function textOf(node: PlateNode): string {
  if (typeof node.text === "string") return node.text;
  return (node.children ?? []).map(textOf).join("");
}

export function bodyExcerpt(body: string | null | undefined): string | null {
  if (!body) return null;

  let nodes: PlateNode[];
  try {
    nodes = JSON.parse(body);
  } catch {
    return clip(body);
  }
  if (!Array.isArray(nodes)) return null;

  const parts: string[] = [];
  let length = 0;

  for (const node of nodes) {
    if (node.type && SKIPPED_BLOCKS.has(node.type)) continue;
    if (node.type && /^h[1-6]$/.test(node.type)) continue;

    const text = textOf(node).replace(/\s+/g, " ").trim();
    if (!text) continue;

    parts.push(text);
    length += text.length;
    if (length >= DESCRIPTION_LENGTH) break;
  }

  return parts.length ? clip(parts.join(" ")) : null;
}

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export function readableDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

export function isoDate(value: string): string | undefined {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function handleOf(url: string): string | undefined {
  try {
    const { hostname, pathname } = new URL(url);
    if (!/(^|\.)(twitter|x)\.com$/.test(hostname)) return undefined;

    const handle = pathname.split("/").filter(Boolean)[0];
    return handle ? `@${handle}` : undefined;
  } catch {
    return undefined;
  }
}

export async function identity() {
  const [site, intro] = await Promise.all([getSite(), getIntro()]);
  const sameAs = intro.socialLinks
    .map((link) => link.url)
    .filter((url) => /^https?:\/\//.test(url));

  return {
    site,
    intro,
    name: intro.title.trim(),
    sameAs,
    twitter: intro.socialLinks.map((link) => handleOf(link.url)).find(Boolean),
  };
}

export async function pageMetadata({
  title,
  description,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
  section,
  tags,
  absoluteTitle = false,
  image,
}: {
  title: string;
  description?: string | null;
  path: string;
  type?: "website" | "article" | "profile";
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  absoluteTitle?: boolean;
  image?: { url: string; alt: string };
}): Promise<Metadata> {
  const { site, name } = await identity();
  const summary = description ? clip(description) : undefined;
  const [firstName, ...rest] = name.split(/\s+/);

  const shared = {
    siteName: site.title,
    locale: LOCALE,
    title,
    ...(summary ? { description: summary } : {}),
    url: path,
    ...(image
      ? {
          images: [
            {
              url: image.url,
              alt: image.alt,
              width: OG_SIZE.width,
              height: OG_SIZE.height,
              type: OG_CONTENT_TYPE,
            },
          ],
        }
      : {}),
  };

  const openGraph: Metadata["openGraph"] =
    type === "article"
      ? {
          ...shared,
          type: "article",
          authors: [siteUrl],
          ...(publishedTime ? { publishedTime } : {}),
          ...(modifiedTime ? { modifiedTime } : {}),
          ...(section ? { section } : {}),
          ...(tags?.length ? { tags } : {}),
        }
      : type === "profile"
        ? {
            ...shared,
            type: "profile",
            firstName,
            ...(rest.length ? { lastName: rest.join(" ") } : {}),
          }
        : { ...shared, type: "website" };

  return {
    title: absoluteTitle ? { absolute: title } : title,
    ...(summary ? { description: summary } : {}),
    alternates: {
      canonical: path,
      types: {
        "application/rss+xml": [{ url: FEED_PATH, title: site.title }],
      },
    },
    openGraph,
  };
}
