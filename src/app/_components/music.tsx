import { getMusic } from "./content";
import { byOrder, spotifyEmbed } from "./data";

export async function Music() {
  const { items } = await getMusic();

  const players = byOrder(items).flatMap((item) => {
    const embed = spotifyEmbed(item.url);
    return embed ? [{ item, embed }] : [];
  });

  return (
    <ul className="space-y-3">
      {players.map(({ item, embed }) => (
        <li
          key={embed.src}
          className="relative overflow-hidden rounded-md"
          style={{ height: embed.height }}
        >
          <iframe
            src={embed.src}
            title={
              item.title
                ? `${item.title} by ${item.artist} on Spotify`
                : `Spotify ${embed.kind} player`
            }
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            className="absolute inset-0 size-full border-0"
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

const EMBED_CORNER = 12;
const PATCH_RADIUS = 11;

const CORNERS = [
  { key: "tl", position: "top-0 left-0", radius: "borderBottomRightRadius" },
  { key: "tr", position: "top-0 right-0", radius: "borderBottomLeftRadius" },
  { key: "bl", position: "bottom-0 left-0", radius: "borderTopRightRadius" },
  { key: "br", position: "bottom-0 right-0", radius: "borderTopLeftRadius" },
] as const;
