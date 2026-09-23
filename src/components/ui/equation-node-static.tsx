import * as React from 'react';

import type { TEquationElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { getEquationHtml } from '@platejs/math';
import { SlateElement } from 'platejs/static';

import { cn } from '@/lib/utils';

export function EquationElementStatic(
  props: SlateElementProps<TEquationElement>
) {
  const { element } = props;
  const texExpression =
    typeof element.texExpression === 'string' ||
    typeof element.texExpression === 'number' ||
    typeof element.texExpression === 'boolean'
      ? String(element.texExpression)
      : '';

  const html = getEquationHtml({
    element,
    options: {
      displayMode: true,
      errorColor: '#cc0000',
      fleqn: false,
      leqno: false,
      macros: { '\\f': '#1f(#2)' },
      output: 'htmlAndMathml',
      strict: 'warn',
      throwOnError: false,
      trust: false,
    },
  });

  return (
    <SlateElement className="pf-prose-block pf-prose-equation" {...props}>
      <div>
        {texExpression.length > 0 ? (
          <span
            dangerouslySetInnerHTML={{
              __html: html,
            }}
          />
        ) : null}
      </div>
      {props.children}
    </SlateElement>
  );
}

export function InlineEquationElementStatic(
  props: SlateElementProps<TEquationElement>
) {
  const texExpression =
    typeof props.element.texExpression === 'string' ||
    typeof props.element.texExpression === 'number' ||
    typeof props.element.texExpression === 'boolean'
      ? String(props.element.texExpression)
      : '';
  const html = getEquationHtml({
    element: props.element,
    options: {
      displayMode: false,
      errorColor: '#cc0000',
      fleqn: false,
      leqno: false,
      macros: { '\\f': '#1f(#2)' },
      output: 'htmlAndMathml',
      strict: 'warn',
      throwOnError: false,
      trust: false,
    },
  });

  return (
    <SlateElement
      {...props}
      className="pf-prose-equation-inline inline-block [&_.katex-display]:my-0"
    >
      <span>
        <span
          className={cn(texExpression.length === 0 && 'hidden')}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </span>
      {props.children}
    </SlateElement>
  );
}

/**
 * DOCX-compatible block equation component.
 * Displays LaTeX source code with styling.
 */
export function EquationElementDocx(
  props: SlateElementProps<TEquationElement>
) {
  const { element } = props;
  const texExpression =
    typeof element.texExpression === 'string' ||
    typeof element.texExpression === 'number' ||
    typeof element.texExpression === 'boolean'
      ? String(element.texExpression)
      : '';

  if (!texExpression) {
    return (
      <SlateElement {...props}>
        <p style={{ color: '#888', fontStyle: 'italic' }}>[Empty equation]</p>
        {props.children}
      </SlateElement>
    );
  }

  return (
    <SlateElement {...props}>
      <p
        style={{
          fontFamily: 'Cambria Math, Consolas, monospace',
          fontSize: '12pt',
          margin: '8pt 0',
          textAlign: 'center',
        }}
      >
        {texExpression}
      </p>
      {props.children}
    </SlateElement>
  );
}

/**
 * DOCX-compatible inline equation component.
 * Displays LaTeX source code inline.
 */
export function InlineEquationElementDocx(
  props: SlateElementProps<TEquationElement>
) {
  const { element } = props;
  const texExpression =
    typeof element.texExpression === 'string' ||
    typeof element.texExpression === 'number' ||
    typeof element.texExpression === 'boolean'
      ? String(element.texExpression)
      : '';

  if (!texExpression) {
    return (
      <SlateElement {...props} as="span">
        <span style={{ color: '#888', fontStyle: 'italic' }}>[equation]</span>
        {props.children}
      </SlateElement>
    );
  }

  return (
    <SlateElement {...props} as="span">
      <span
        style={{
          fontFamily: 'Cambria Math, Consolas, monospace',
        }}
      >
        {texExpression}
      </span>
      {props.children}
    </SlateElement>
  );
}
