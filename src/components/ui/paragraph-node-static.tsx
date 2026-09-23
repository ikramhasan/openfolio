import * as React from 'react';

import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';

export function ParagraphElementStatic(props: SlateElementProps) {
  const inList = Boolean(props.element.listStyleType);

  return (
    <SlateElement
      {...props}
      className={cn(
        'pf-prose-block',
        inList ? 'pf-prose-item' : 'pf-prose-p'
      )}
    >
      {props.children}
    </SlateElement>
  );
}
