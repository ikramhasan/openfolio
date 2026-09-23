import { getMusic } from "./content";
import { byOrder, spotifyEmbed } from "./data";

/**
 * Records on repeat, as Spotify's own players — one per track, and nothing of ours
 * around them. Each plays thirty seconds to a visitor who is not signed in to Spotify
 * and the whole track to one who is.
 *
 * Plain iframes rather than the iFrame API, so the section carries no JavaScript.
 * `loading="lazy"` keeps a third-party frame from being fetched until it is near the
 * viewport, which matters when there is one per record rather than one for the list.
 *
 * A record whose link is not a Spotify one has no player and is left out.
 */
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
          {/*
            The player, as it comes from Spotify. What it shows is its own; the
            record's title and artist are here only as the frame's accessible name,
            since a screen reader cannot see into the document it holds.
          */}
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

          {/* The corners of the embed's own white backdrop, covered in the card's
              colour. Outside Spotify's card, so none of the player is hidden. */}
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

/**
 * The corner of Spotify's own card, in pixels, and the size of the patches that cover
 * what surrounds it.
 *
 * The embed paints an opaque white backdrop of its own — `color-scheme` and a
 * background on the iframe were both measured to make no difference — and draws a
 * 12px-radius card on top of it. Everything outside that curve is that white, and
 * clipping can only be rid of it by rounding the frame to 12px or more, twice what
 * anything else here uses. So each corner is covered instead, in the card's own
 * colour, which leaves the player reading as a `rounded-md` card.
 *
 * The patch's curve is a pixel tighter than the card's so the two antialiased edges
 * overlap rather than meet, which is where a seam would otherwise show.
 */
const EMBED_CORNER = 12;
const PATCH_RADIUS = 11;

/** Each patch sits in a corner and is cut away towards the middle of the card. */
const CORNERS = [
  { key: "tl", position: "top-0 left-0", radius: "borderBottomRightRadius" },
  { key: "tr", position: "top-0 right-0", radius: "borderBottomLeftRadius" },
  { key: "bl", position: "bottom-0 left-0", radius: "borderTopRightRadius" },
  { key: "br", position: "bottom-0 right-0", radius: "borderTopLeftRadius" },
] as const;
