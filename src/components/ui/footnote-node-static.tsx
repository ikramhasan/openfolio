import * as React from 'react';

import type { TFootnoteElement } from '@platejs/footnote';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function FootnoteReferenceElementStatic(
  props: SlateElementProps<TFootnoteElement>
) {
  const { element } = props;

  return (
    <SlateElement
      {...props}
      as="sup"
      className="pf-prose-footnote-ref"
    >
      {props.children}[{element.identifier ?? ''}]
    </SlateElement>
  );
}

export function FootnoteDefinitionElementStatic(
  props: SlateElementProps<TFootnoteElement>
) {
  const { element } = props;

  return (
    <SlateElement
      {...props}
      as="div"
      className="pf-prose-block pf-prose-footnote flex items-start gap-2"
    >
      <div className="min-w-4 tabular-nums">{element.identifier ?? ''}</div>
      <div className="min-w-0 flex-1">{props.children}</div>
    </SlateElement>
  );
}
