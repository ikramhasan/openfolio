import * as React from 'react';

import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';

export function HrElementStatic(props: SlateElementProps) {
  return (
    <SlateElement {...props} className="pf-prose-block">
      <div contentEditable={false}>
        <hr className={cn('pf-prose-hr')} />
      </div>
      {props.children}
    </SlateElement>
  );
}
