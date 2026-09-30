import { getMusic } from "./content";
import { byOrder, spotifyEmbed } from "./data";

export async function Music({ limit }: { limit?: number } = {}) {
  const { items } = await getMusic();

  const players = byOrder(items)
    .flatMap((item) => {
      const embed = spotifyEmbed(item.url);
      return embed ? [{ item, embed }] : [];
    })
    .slice(0, limit);

  return (
    <ul className="space-y-3">
      {players.map(({ item, embed }) => (
        <li
          key={embed.src}
          className="relative overflow-hidden rounded-md"
          style={{ height: embed.height }}
        >
          <Placeholder height={embed.height} />

          <iframe
            src={embed.src}
            title={
              item.title
                ? `${item.title} by ${item.artist} on Spotify`
                : `Spotify ${embed.kind} player`
            }
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="absolute inset-0 size-full border-0 [color-scheme:normal]"
          />

          {CORNERS.map(({ key, position, radius }) => (
            <span
              key={key}
              aria-hidden="true"
              className={`pf-embed-corner absolute ${position}`}
              style={{
                width: EMBED_CORNER,
                height: EMBED_CORNER,
                [radius]: PATCH_RADIUS,
              }}
            />
          ))}
        </li>
      ))}
    </ul>
  );
}

function Placeholder({ height }: { height: number }) {
  const inset = height > 80 ? 16 : 8;
  const art = height - inset * 2;

  return (
    <div
      aria-hidden="true"
      className="pf-embed-placeholder absolute inset-0 flex items-center gap-3"
      style={{ padding: inset }}
    >
      <span
        className="pf-embed-bone shrink-0 rounded"
        style={{ width: art, height: art }}
      />
      <span className="flex min-w-0 flex-1 flex-col gap-2 self-start pt-2">
        <span className="pf-embed-bone h-3 w-32 max-w-full rounded-sm" />
        <span className="pf-embed-bone h-2.5 w-20 max-w-full rounded-sm" />
      </span>
      <span className="pf-embed-bone size-6 shrink-0 self-start rounded-full" />
    </div>
  );
}

const EMBED_CORNER = 12;
const PATCH_RADIUS = 11;

const CORNERS = [
  { key: "tl", position: "top-0 left-0", radius: "borderBottomRightRadius" },
  { key: "tr", position: "top-0 right-0", radius: "borderBottomLeftRadius" },
  { key: "bl", position: "bottom-0 left-0", radius: "borderTopRightRadius" },
  { key: "br", position: "bottom-0 right-0", radius: "borderTopLeftRadius" },
] as const;
