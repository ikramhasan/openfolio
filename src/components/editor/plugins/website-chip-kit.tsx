'use client';

import { toPlatePlugin } from 'platejs/react';

import { WebsiteChipElement } from '@/components/ui/website-chip-node';

import { BaseWebsiteChipPlugin } from './website-chip-base-plugin';

export const WebsiteChipPlugin = toPlatePlugin(BaseWebsiteChipPlugin);

export const WebsiteChipKit = [
  WebsiteChipPlugin.withComponent(WebsiteChipElement),
];
