import * as React from 'react';

import type { TCaptionProps, TImageElement, TResizableProps } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { NodeApi } from 'platejs';
import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';

export function ImageElementStatic(
  props: SlateElementProps<TImageElement & TCaptionProps & TResizableProps>
) {
  const { align = 'center', caption, url, width } = props.element;

  return (
    <SlateElement {...props} className="pf-prose-block pf-prose-figure">
      <figure className="m-0" style={{ width, textAlign: align }}>
        <img
          className={cn('pf-prose-image')}
          alt={(props.attributes as any).alt}
          src={url}
        />
        {caption && (
          <figcaption className="pf-prose-caption">
            {NodeApi.string(caption[0])}
          </figcaption>
        )}
      </figure>
      {props.children}
    </SlateElement>
  );
}
