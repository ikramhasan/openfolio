import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { cacheLife } from "next/cache";
import { ImageResponse } from "next/og";
import { textToSvg } from "tegaki/core";
import bundle from "tegaki/fonts/nanum-pen-script";
import { getIntro } from "./content";
import { clip, OG_CONTENT_TYPE, OG_SIZE } from "./seo";
import { siteUrl } from "./site-url";

export { OG_CONTENT_TYPE, OG_SIZE };

const INK = "#0a0a0a";
const MUTED = "#52525b";
const FAINT = "#6f6f78";
const RULE = "#e4e4e7";
const PAPER = "#ffffff";
const HOVER = "#f4f4f5";

const RASTER_TYPES = new Set(["image/png", "image/jpeg", "image/gif"]);

const fontDir = join(process.cwd(), "assets/fonts");

const [regular, medium, semibold] = await Promise.all(
  ["Inter-Regular.ttf", "Inter-Medium.ttf", "Inter-SemiBold.ttf"].map((file) =>
    readFile(join(fontDir, file)),
  ),
);

const fonts = [
  {
    name: "Inter",
    data: regular,
    weight: 400 as const,
    style: "normal" as const,
  },
  {
    name: "Inter",
    data: medium,
    weight: 500 as const,
    style: "normal" as const,
  },
  {
    name: "Inter",
    data: semibold,
    weight: 600 as const,
    style: "normal" as const,
  },
];

export async function imageData(url: string | null | undefined) {
  "use cache";
  cacheLife("max");

  if (!url) return null;

  try {
    const response = await fetch(url);
    if (!response.ok) return null;

    const type = response.headers.get("content-type")?.split(";")[0].trim();
    if (!type || !RASTER_TYPES.has(type)) return null;

    const bytes = Buffer.from(await response.arrayBuffer());
    return `data:${type};base64,${bytes.toString("base64")}`;
  } catch {
    return null;
  }
}

function signature(name: string, fontSize: number) {
  const svg = textToSvg(name, bundle, {
    fontSize,
    letterSpacing: -fontSize / 17,
    mode: "static",
    color: INK,
  });

  const box = svg.match(/viewBox="([^"]+)"/);
  if (!box) return null;

  const [x, , width] = box[1].split(" ").map(Number);
  const ys = [...svg.matchAll(/ y[12]="([\d.-]+)"/g)].map((m) => Number(m[1]));
  if (ys.length === 0) return null;

  const pad = 8;
  const stroke = fontSize / 14;
  const sag = fontSize / 24;
  const top = Math.min(...ys) - pad;
  const base = Math.max(...ys) + fontSize / 5;
  const bottom = base + sag + stroke + pad;
  const height = bottom - top;
  const left = x + pad;
  const right = x + width - pad;
  const d = `M ${left} ${base + sag} C ${left + (right - left) * 0.2} ${base - sag / 3}, ${left + (right - left) * 0.8} ${base - sag / 3}, ${right} ${base + sag}`;

  const drawn = svg
    .replace(box[0], `viewBox="${x} ${top} ${width} ${height}"`)
    .replace(/height="[\d.]+"/, `height="${height}"`)
    .replace(
      /<\/g>\s*<\/svg>\s*$/,
      `<path d="${d}" stroke-width="${stroke}" /></g></svg>`,
    );

  return {
    src: `data:image/svg+xml;base64,${Buffer.from(drawn).toString("base64")}`,
    width,
    height,
  };
}

function host() {
  try {
    return new URL(siteUrl).host;
  } catch {
    return siteUrl;
  }
}

function titleSize(text: string) {
  if (text.length <= 24) return 88;
  if (text.length <= 44) return 72;
  if (text.length <= 72) return 60;
  return 52;
}

function Portrait({ src, size }: { src: string; size: number }) {
  return (
    <div
      style={{
        display: "flex",
        width: size,
        height: size,
        borderRadius: size / 2,
        background: HOVER,
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}
    >
      {/* biome-ignore lint/performance/noImgElement: satori rasterises this, next/image cannot run here */}
      <img
        src={src}
        width={size}
        height={size}
        alt=""
        style={{ objectFit: "cover" }}
      />
    </div>
  );
}

function Footer({ path, meta }: { path: string; meta: string[] }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: `1px solid ${RULE}`,
        paddingTop: 28,
        fontSize: 24,
        lineHeight: 1.2,
      }}
    >
      <div style={{ display: "flex", color: MUTED, fontWeight: 500 }}>
        <span style={{ color: INK }}>{host()}</span>
        {path === "/" ? null : <span>{path}</span>}
      </div>
      <div style={{ display: "flex", gap: 22, color: FAINT }}>
        {meta.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </div>
  );
}

function Canvas({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        padding: "64px 80px 60px",
        background: PAPER,
        color: INK,
        fontFamily: "Inter",
      }}
    >
      {children}
    </div>
  );
}

export async function renderHomeCard(): Promise<ImageResponse> {
  const intro = await getIntro();
  const portrait = await imageData(intro.profileImage);
  const name = intro.title.trim();
  const words = name.split(/\s+/);
  const last = words.pop() ?? "";
  const mark = signature(name, 48);
  const elsewhere = intro.socialLinks
    .filter((link) => !link.url.startsWith("mailto:"))
    .slice(0, 4)
    .map((link) => link.title);

  return new ImageResponse(
    <Canvas>
      <div style={{ display: "flex" }}>
        {mark ? (
          // biome-ignore lint/performance/noImgElement: satori rasterises this, next/image cannot run here
          <img
            src={mark.src}
            width={mark.width}
            height={mark.height}
            alt=""
            style={{ marginLeft: -8 }}
          />
        ) : null}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          flexGrow: 1,
          paddingBottom: 44,
        }}
      >
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            columnGap: 26,
            fontSize: 118,
            fontWeight: 600,
            letterSpacing: "-0.045em",
            lineHeight: 1,
          }}
        >
          {words.length ? <span>{words.join(" ")}</span> : null}
          <span style={{ display: "flex", alignItems: "center", gap: 22 }}>
            {last}
            {portrait ? <Portrait src={portrait} size={112} /> : null}
          </span>
        </div>

        {intro.bio ? (
          <div
            style={{
              display: "block",
              marginTop: 30,
              maxWidth: 860,
              fontSize: 34,
              lineHeight: 1.35,
              color: MUTED,
              letterSpacing: "-0.01em",
              lineClamp: 2,
            }}
          >
            {intro.bio.trim()}
          </div>
        ) : null}
      </div>

      <Footer path="/" meta={elsewhere} />
    </Canvas>,
    { ...OG_SIZE, fonts },
  );
}

export async function renderPageCard({
  title,
  standfirst,
  path,
  meta = [],
}: {
  title: string;
  standfirst?: string | null;
  path: string;
  meta?: string[];
}): Promise<ImageResponse> {
  const intro = await getIntro();
  const portrait = await imageData(intro.profileImage);
  const name = intro.title.trim();
  const mark = signature(name, 44);
  const size = titleSize(title);

  return new ImageResponse(
    <Canvas>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {portrait ? <Portrait src={portrait} size={60} /> : null}
        {mark ? (
          // biome-ignore lint/performance/noImgElement: satori rasterises this, next/image cannot run here
          <img
            src={mark.src}
            width={mark.width}
            height={mark.height}
            alt=""
            style={{ marginLeft: -8 }}
          />
        ) : (
          <span style={{ fontSize: 28, fontWeight: 600 }}>{name}</span>
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          flexGrow: 1,
          paddingBottom: 44,
        }}
      >
        <div
          style={{
            display: "block",
            fontSize: size,
            fontWeight: 600,
            letterSpacing: "-0.035em",
            lineHeight: 1.08,
            textWrap: "balance",
            lineClamp: 3,
          }}
        >
          {title.trim()}
        </div>

        {standfirst ? (
          <div
            style={{
              display: "block",
              marginTop: 26,
              maxWidth: 940,
              fontSize: 30,
              lineHeight: 1.4,
              color: MUTED,
              letterSpacing: "-0.01em",
              lineClamp: 2,
            }}
          >
            {clip(standfirst, 150)}
          </div>
        ) : null}
      </div>

      <Footer path={path} meta={meta} />
    </Canvas>,
    { ...OG_SIZE, fonts },
  );
}
