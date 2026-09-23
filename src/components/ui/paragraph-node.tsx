'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement } from 'platejs/react';

import { cn } from '@/lib/utils';

export function ParagraphElement(props: PlateElementProps) {
  return (
    <PlateElement {...props} className={cn('pf-prose-block', props.element.listStyleType ? 'pf-prose-item' : 'pf-prose-p')}>
      {props.children}
    </PlateElement>
  );
}
