import * as React from 'react';

import { type SlateElementProps, SlateElement } from 'platejs/static';

export function BlockquoteElementStatic(props: SlateElementProps) {
  return (
    <SlateElement
      as="blockquote"
      className="pf-prose-block pf-prose-quote"
      {...props}
    />
  );
}
