import * as React from 'react';

import type { TAudioElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';

export function AudioElementStatic(props: SlateElementProps<TAudioElement>) {
  return (
    <SlateElement {...props} className="pf-prose-block pf-prose-figure">
      <figure className="m-0">
        <audio
          className={cn('pf-prose-audio')}
          src={props.element.url}
          controls
        />
      </figure>
      {props.children}
    </SlateElement>
  );
}
