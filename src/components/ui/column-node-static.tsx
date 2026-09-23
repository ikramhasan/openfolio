import * as React from 'react';

import type { TColumnElement } from 'platejs';
import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

export function ColumnElementStatic(props: SlateElementProps<TColumnElement>) {
  const { width } = props.element;

  return (
    <div className="pf-prose-column" style={{ width: width ?? '100%' }}>
      <SlateElement {...props}>
        {props.children}
      </SlateElement>
    </div>
  );
}

export function ColumnGroupElementStatic(props: SlateElementProps) {
  return (
    <SlateElement className="pf-prose-block" {...props}>
      <div className="pf-prose-columns">{props.children}</div>
    </SlateElement>
  );
}

/**
 * DOCX-compatible column component using table cell.
 */
export function ColumnElementDocx(props: SlateElementProps<TColumnElement>) {
  const { width } = props.element;

  return (
    <SlateElement
      {...props}
      as="td"
      style={{
        width: width ?? 'auto',
        verticalAlign: 'top',
        padding: '4px 8px',
        border: 'none',
      }}
    >
      {props.children}
    </SlateElement>
  );
}

/**
 * DOCX-compatible column group component using table layout.
 */
export function ColumnGroupElementDocx(props: SlateElementProps) {
  return (
    <SlateElement {...props}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          border: 'none',
          tableLayout: 'fixed',
        }}
      >
        <tbody>
          <tr>{props.children}</tr>
        </tbody>
      </table>
    </SlateElement>
  );
}
