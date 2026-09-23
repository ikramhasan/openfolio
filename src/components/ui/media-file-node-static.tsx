import * as React from 'react';

import type { TFileElement } from 'platejs';
import type { TSuggestionData } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { FileUp } from 'lucide-react';
import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';

export function FileElementStatic(props: SlateElementProps<TFileElement>) {
  const { name, url } = props.element;
  const suggestionData = (
    props.element as TFileElement & {
      suggestion?: TSuggestionData;
    }
  ).suggestion;
  const isRemoveSuggestion = suggestionData?.type === 'remove';

  return (
    <SlateElement className="pf-prose-block" {...props}>
      <a
        className={cn(
          'pf-prose-file',
          isRemoveSuggestion && 'pf-prose-suggestion-remove'
        )}
        contentEditable={false}
        download={name}
        href={url}
        rel="noopener noreferrer"
        role="button"
        target="_blank"
      >
        <FileUp className="size-4 shrink-0 text-(--pf-faint)" />
        <span className="pf-prose-file-name truncate">{name}</span>
      </a>
      {props.children}
    </SlateElement>
  );
}
