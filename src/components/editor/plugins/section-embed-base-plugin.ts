import { createSlatePlugin } from 'platejs';

export const SECTION_EMBED_KEY = 'section_embed';

export const EMBEDDABLE_SECTIONS = [
  { id: 'experience', label: 'Experience', keywords: ['work', 'career', 'jobs', 'timeline'] },
  { id: 'projects', label: 'Projects', keywords: ['apps', 'work'] },
  { id: 'education', label: 'Education', keywords: ['school', 'university', 'degree'] },
  { id: 'openSource', label: 'Open source', keywords: ['github', 'contributions', 'pull requests'] },
  { id: 'articles', label: 'Articles', keywords: ['writing', 'posts', 'blog'] },
  { id: 'awards', label: 'Achievements', keywords: ['awards', 'honors'] },
  { id: 'youtubeVideos', label: 'Videos', keywords: ['youtube', 'video'] },
  { id: 'music', label: 'Music', keywords: ['spotify', 'playlists'] },
  { id: 'recommendations', label: 'References', keywords: ['recommendations', 'testimonials', 'quotes'] },
] as const;

export type EmbeddableSection = (typeof EMBEDDABLE_SECTIONS)[number]['id'];

export type TSectionEmbedElement = {
  type: string;
  section: EmbeddableSection;
  limit?: number;
  prompt?: boolean;
  children: [{ text: '' }];
};

export function isEmbeddableSection(value: unknown): value is EmbeddableSection {
  return EMBEDDABLE_SECTIONS.some((entry) => entry.id === value);
}

export function embedLimit(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isInteger(value) && value > 0
    ? value
    : undefined;
}

export function sectionLabel(section: string): string {
  return (
    EMBEDDABLE_SECTIONS.find((entry) => entry.id === section)?.label ?? section
  );
}

export const BaseSectionEmbedPlugin = createSlatePlugin({
  key: SECTION_EMBED_KEY,
  node: {
    isElement: true,
    isVoid: true,
  },
});
