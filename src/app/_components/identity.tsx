import { textToSvg } from "tegaki/core";
import bundle from "tegaki/fonts/nanum-pen-script";
import { getIntro } from "./content";

const FONT_SIZE = 34;
const LETTER_SPACING = -2;

const INK_PAD = 8;
const UNDERLINE_GAP = 4;
const UNDERLINE_SAG = 3;
const UNDERLINE_WIDTH = 2.4;
const UNDERLINE_DELAY = 0.15;
const UNDERLINE_DRAW = 0.5;
const EXTRA_HOLD = 1.2;

function fmt(n: number) {
  return String(Math.round(n * 100) / 100);
}

function withUnderline(svg: string) {
  const fade = svg.match(
    /@keyframes tk-fade \{ 0%,([\d.]+)% \{ opacity:1 \} ([\d.]+)%,100%/,
  );
  const period = svg.match(/tk-fade ([\d.]+)s infinite/);
  const box = svg.match(/viewBox="([^"]+)"/);
  if (!fade || !period || !box) return svg;

  const holdEnd = Number(fade[1]);
  const fadeEnd = Number(fade[2]);
  const cycle = Number(period[1]);
  const next = cycle + EXTRA_HOLD;

  const drawEnds = [
    ...svg.matchAll(/([\d.]+)%,([\d.]+)% \{ stroke-dashoffset:0/g),
  ]
    .filter((match) => Number(match[2]) === holdEnd)
    .map((match) => Number(match[1]));
  const written = (Math.max(0, ...drawEnds) / 100) * cycle;

  const shift = (pct: number) =>
    pct < holdEnd
      ? (pct * cycle) / next
      : (((pct / 100) * cycle + EXTRA_HOLD) / next) * 100;
  const at = (seconds: number) => (seconds / next) * 100;

  const start = at(written + UNDERLINE_DELAY);
  const drawn = at(written + UNDERLINE_DELAY + UNDERLINE_DRAW);
  const keyframes = `@keyframes pf-underline { 0%,${fmt(start)}% { stroke-dashoffset:1.05 } ${fmt(drawn)}%,${fmt(shift(holdEnd))}% { stroke-dashoffset:0 } ${fmt(shift(fadeEnd))}%,100% { stroke-dashoffset:1.05 } } .pf-signature-underline { animation: pf-underline ${fmt(next)}s infinite }`;

  const [x, y, width, height] = box[1].split(" ").map(Number);
  const left = x + INK_PAD - 1;
  const right = x + width - INK_PAD + 3;
  const span = right - left;
  const base = y + height - INK_PAD + UNDERLINE_GAP;
  const bottom = base + UNDERLINE_SAG + UNDERLINE_WIDTH / 2 + INK_PAD;
  const grown = bottom - y;

  const ends = base + UNDERLINE_SAG;
  const crest = base - UNDERLINE_SAG / 3;
  const d = `M ${fmt(left)} ${fmt(ends)} C ${fmt(left + span * 0.2)} ${fmt(crest)}, ${fmt(left + span * 0.8)} ${fmt(crest)}, ${fmt(right)} ${fmt(ends)}`;
  const path = `<path class="pf-signature-underline" d="${d}" fill="none" stroke="currentColor" stroke-width="${UNDERLINE_WIDTH}" stroke-linecap="round" pathLength="1" stroke-dasharray="1 2" stroke-dashoffset="1.05" />`;

  return svg
    .replace(/<style>([\s\S]*?)<\/style>/, (_, css: string) => {
      const retimed = css
        .replace(
          /([\d.]+)%/g,
          (_, pct: string) => `${fmt(shift(Number(pct)))}%`,
        )
        .replaceAll(`${period[1]}s infinite`, `${fmt(next)}s infinite`);
      return `<style>${retimed} ${keyframes}</style>`;
    })
    .replace(
      box[0],
      `viewBox="${box[1].split(" ").slice(0, 3).join(" ")} ${fmt(grown)}"`,
    )
    .replace(/height="[\d.]+"/, `height="${fmt(grown)}"`)
    .replace(/\n<\/g>\n<\/svg>$/, `\n${path}\n</g>\n</svg>`);
}

export async function Identity() {
  const { title } = await getIntro();

  if (!title) return null;

  const svg = withUnderline(
    textToSvg(title, bundle, {
      fontSize: FONT_SIZE,
      letterSpacing: LETTER_SPACING,
      mode: "loop",
      color: "currentColor",
    }),
  );

  return (
    <div className="hidden min-w-0 pt-[7px] pb-5 lg:block">
      <span
        role="img"
        aria-label={title}
        className="pf-handwriting block"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: tegaki emits stroke geometry only, never the source text
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
