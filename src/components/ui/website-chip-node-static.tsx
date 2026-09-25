import * as React from 'react';

import type { SlateElementProps } from 'platejs/static';

import { SlateElement } from 'platejs/static';

import { faviconUrl, hostOf } from '@/app/_components/data';

export type TWebsiteChipElement = {
  url?: string;
  label?: string;
  children: [{ text: '' }];
  type: string;
};

export function WebsiteChipElementStatic(
  props: SlateElementProps<TWebsiteChipElement>
) {
  const { element } = props;
  const url = element.url ?? '';
  const label = element.label?.trim() || hostOf(url) || 'Website';
  const icon = faviconUrl(url);

  return (
    <SlateElement as="span" className="inline-block" {...props}>
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="pf-prose-chip pf-prose-chip-website"
        >
          {icon ? (
            // biome-ignore lint/performance/noImgElement: favicon host is arbitrary
            <img src={icon} alt="" className="pf-prose-chip-website-icon" />
          ) : null}
          {label}
        </a>
      ) : (
        <span className="pf-prose-chip pf-prose-chip-website">
          {icon ? (
            // biome-ignore lint/performance/noImgElement: favicon host is arbitrary
            <img src={icon} alt="" className="pf-prose-chip-website-icon" />
          ) : null}
          {label}
        </span>
      )}
      {props.children}
    </SlateElement>
  );
}
