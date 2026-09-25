import { createSlatePlugin } from 'platejs';

export const WEBSITE_CHIP_KEY = 'website_chip';

export const BaseWebsiteChipPlugin = createSlatePlugin({
  key: WEBSITE_CHIP_KEY,
  node: {
    isElement: true,
    isInline: true,
    isVoid: true,
  },
});
