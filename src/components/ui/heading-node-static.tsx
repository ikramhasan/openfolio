import * as React from 'react';

import type { SlateElementProps } from 'platejs/static';

import { type VariantProps, cva } from 'class-variance-authority';
import { SlateElement } from 'platejs/static';

// The look is in `app/prose.css`; the rhythm keys off `pf-prose-block`.
const headingVariants = cva('pf-prose-block', {
  variants: {
    variant: {
      h1: 'pf-prose-h1',
      h2: 'pf-prose-h2',
      h3: 'pf-prose-h3',
      h4: 'pf-prose-h4',
      h5: 'pf-prose-h5',
      h6: 'pf-prose-h6',
    },
  },
});

export function HeadingElementStatic({
  variant = 'h1',
  ...props
}: SlateElementProps & VariantProps<typeof headingVariants>) {
  const id = props.element.id as string | undefined;

  return (
    <SlateElement
      as={variant!}
      className={headingVariants({ variant })}
      {...props}
    >
      {/* Bookmark anchor for DOCX TOC internal links */}
      {!!id && <span id={id} />}
      {props.children}
    </SlateElement>
  );
}

export function H1ElementStatic(props: SlateElementProps) {
  return <HeadingElementStatic variant="h1" {...props} />;
}

export function H2ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h2" {...props} />;
}

export function H3ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h3" {...props} />;
}

export function H4ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h4" {...props} />;
}

export function H5ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h5" {...props} />;
}

export function H6ElementStatic(
  props: React.ComponentProps<typeof HeadingElementStatic>
) {
  return <HeadingElementStatic variant="h6" {...props} />;
}
