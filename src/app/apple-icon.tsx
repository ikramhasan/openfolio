import { ICON_BACKGROUND, renderIcon } from "./_components/icon-image";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return renderIcon(size.width, {
    shape: "square",
    background: ICON_BACKGROUND,
  });
}
