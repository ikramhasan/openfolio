import { ImageResponse } from "next/og";
import { getIntro } from "./content";

export const ICON_BACKGROUND = "#ffffff";

export async function renderIcon(
  size: number,
  {
    padding = 0,
    shape = "circle",
    background = "transparent",
  }: {
    padding?: number;
    shape?: "circle" | "square";
    background?: string;
  } = {},
): Promise<ImageResponse> {
  const intro = await getIntro();
  const inset = Math.round(size * padding);
  const edge = size - inset * 2;

  return new ImageResponse(
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "100%",
        height: "100%",
        background,
      }}
    >
      {intro.profileImage ? (
        // biome-ignore lint/performance/noImgElement: satori rasterises this, next/image cannot run here
        <img
          src={intro.profileImage}
          width={edge}
          height={edge}
          alt=""
          style={{
            objectFit: "cover",
            borderRadius: shape === "circle" ? edge / 2 : 0,
          }}
        />
      ) : null}
    </div>,
    { width: size, height: size },
  );
}
