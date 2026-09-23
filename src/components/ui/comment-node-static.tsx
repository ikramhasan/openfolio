import * as React from 'react';

import type { TCommentText } from 'platejs';
import type { SlateLeafProps } from 'platejs/static';

import { SlateLeaf } from 'platejs/static';

export function CommentLeafStatic(props: SlateLeafProps<TCommentText>) {
  return (
    <SlateLeaf
      {...props}
      className="pf-prose-comment"
    >
      {props.children}
    </SlateLeaf>
  );
}
