import * as React from 'react';

import type { TAudioElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';

export function AudioElementStatic(props: SlateElementProps<TAudioElement>) {
  const { url } = props.element;

  return (
    <SlateElement {...props} className="pf-prose-block pf-prose-figure">
      <figure className="m-0">
        {url ? (
          <audio className={cn('pf-prose-audio')} src={url} controls />
        ) : null}
      </figure>
      {props.children}
    </SlateElement>
  );
}
