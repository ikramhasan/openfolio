import * as React from 'react';

import type { TCaptionElement, TResizableProps, TVideoElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { NodeApi } from 'platejs';
import { SlateElement } from 'platejs/static';

export function VideoElementStatic(
  props: SlateElementProps<TVideoElement & TCaptionElement & TResizableProps>
) {
  const { align = 'center', caption, url, width } = props.element;

  return (
    <SlateElement className="pf-prose-block pf-prose-figure" {...props}>
      <figure className="m-0" style={{ width, textAlign: align }}>
        {url ? (
          <video className="pf-prose-video w-full" src={url} controls />
        ) : null}
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
