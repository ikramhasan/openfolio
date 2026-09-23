import * as React from 'react';

import type { SlateElementProps } from 'platejs/static';

import { ChevronRight } from 'lucide-react';
import { SlateElement } from 'platejs/static';

export function ToggleElementStatic(props: SlateElementProps) {
  return (
    <SlateElement {...props} className="pf-prose-block pf-prose-toggle">
      <div className="pf-prose-toggle-summary">
        <ChevronRight className="pf-prose-toggle-caret size-3.5" />
        <div className="min-w-0 flex-1">{props.children}</div>
      </div>
    </SlateElement>
  );
}
