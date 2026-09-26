import { ICON_BACKGROUND, renderIcon } from "./_components/icon-image";

const SIZES = [16, 32, 192, 512];
const MASKABLE_PADDING = 0.1;

export function generateImageMetadata() {
  return [
    ...SIZES.map((edge) => ({
      id: String(edge),
      contentType: "image/png",
      size: { width: edge, height: edge },
    })),
    {
      id: "maskable",
      contentType: "image/png",
      size: { width: 512, height: 512 },
    },
  ];
}

export default async function Icon({ id }: { id: Promise<string> }) {
  const which = await id;

  return which === "maskable"
    ? renderIcon(512, {
        padding: MASKABLE_PADDING,
        shape: "square",
        background: ICON_BACKGROUND,
      })
    : renderIcon(Number(which));
}
