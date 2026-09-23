import { cva } from 'class-variance-authority';

/*
 * Empty on purpose. An inline suggestion is marked by `data-inline-suggestion` on the
 * node or on an ancestor, which a descendant selector reads directly — so the look
 * lives in `app/prose.css` with every other suggestion, rather than as two colours
 * hard-coded behind a Tailwind variant.
 */
export const inlineSuggestionVariants = cva('');
