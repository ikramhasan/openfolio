import * as React from 'react';

import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import type { TSectionEmbedElement } from '@/components/editor/plugins/section-embed-base-plugin';

export function SectionEmbedElementStatic(
  props: SlateElementProps<TSectionEmbedElement>
) {
  return (
    <SlateElement {...props} className="pf-prose-block pf-prose-section">
      {props.children}
    </SlateElement>
  );
}
