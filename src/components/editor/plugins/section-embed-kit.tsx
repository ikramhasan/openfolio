'use client';

import { toPlatePlugin } from 'platejs/react';

import { SectionEmbedElement } from '@/components/ui/section-embed-node';

import { BaseSectionEmbedPlugin } from './section-embed-base-plugin';

export const SectionEmbedPlugin = toPlatePlugin(BaseSectionEmbedPlugin);

export const SectionEmbedKit = [
  SectionEmbedPlugin.withComponent(SectionEmbedElement),
];
