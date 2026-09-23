import * as React from 'react';

import type { RenderStaticNodeWrapper, TListElement } from 'platejs';
import type { SlateRenderElementProps } from 'platejs/static';

import { isOrderedList } from '@platejs/list';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

const config: Record<
  string,
  {
    Li: React.FC<SlateRenderElementProps>;
    Marker: React.FC<SlateRenderElementProps>;
  }
> = {
  todo: {
    Li: TodoLiStatic,
    Marker: TodoMarkerStatic,
  },
};

/*
 * Only ordered and todo lists are wrapped, and that is deliberate on Plate's part:
 * for those it leaves the block itself without a marker and the `<ol>` supplies the
 * numbering, while a `disc` block is given `display: list-item` and draws its own.
 * Wrapping that one too puts two markers on every bullet.
 */
export const BlockListStatic: RenderStaticNodeWrapper = (props) => {
  if (!props.element.listStyleType) return;
  if (!isOrderedList(props.element)) return;

  return (props) => <List {...props} />;
};

function List(props: SlateRenderElementProps) {
  const { indent, listStart, listStyleType } = props.element as TListElement & {
    indent?: number;
  };
  const { Li, Marker } = config[listStyleType] ?? {};
  const List = isOrderedList(props.element) ? 'ol' : 'ul';

  // Apply margin-left for indent (24px per level) for DOCX export compatibility
  const marginLeft = indent ? `${indent * 24}px` : undefined;

  return (
    <List
      className="pf-prose-list"
      style={{ listStyleType, marginLeft }}
      start={listStart}
    >
      {Marker && <Marker {...props} />}
      {Li ? <Li {...props} /> : <li className="pf-prose-li">{props.children}</li>}
    </List>
  );
}

function TodoMarkerStatic(props: SlateRenderElementProps) {
  const checked = props.element.checked as boolean;

  return (
    <div contentEditable={false}>
      {/* Not a button: nothing on a published page can be ticked. */}
      <span
        className={cn('pf-prose-checkbox', props.className)}
        data-checked={checked ? 'true' : 'false'}
      >
        {checked && <CheckIcon className="size-2.5" strokeWidth={3} />}
      </span>
    </div>
  );
}

function TodoLiStatic(props: SlateRenderElementProps) {
  return (
    <li
      className={cn('pf-prose-li', 'pf-prose-todo')}
      data-checked={(props.element.checked as boolean) ? 'true' : 'false'}
    >
      {props.children}
    </li>
  );
}
