'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import { PlateElement, useReadOnly, useSelected } from 'platejs/react';

import { faviconUrl, hostOf } from '@/app/_components/data';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import type { TWebsiteChipElement } from './website-chip-node-static';

export function WebsiteChipElement(
  props: PlateElementProps<TWebsiteChipElement>
) {
  const { editor, element } = props;
  const readOnly = useReadOnly();
  const selected = useSelected();
  const [open, setOpen] = React.useState(false);
  const [url, setUrl] = React.useState(element.url ?? '');
  const [label, setLabel] = React.useState(element.label ?? '');

  React.useEffect(() => {
    if (!open) return;
    setUrl(element.url ?? '');
    setLabel(element.label ?? '');
  }, [open, element.url, element.label]);

  const displayLabel = element.label?.trim() || hostOf(element.url ?? '') || 'Website';
  const icon = faviconUrl(element.url ?? '');

  React.useEffect(() => {
    if (readOnly || !selected || element.url) return;

    // The chip is usually inserted from a slash-command or toolbar menu,
    // both of which are Radix overlays. Opening this popover in the same
    // event cycle races their own dismiss handling and gets the popover
    // dismissed before it is visible, so defer to the next frame.
    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trigger = (
    <span
      className="pf-prose-chip pf-prose-chip-website"
      contentEditable={false}
      draggable
    >
      {icon ? (
        // biome-ignore lint/performance/noImgElement: favicon host is arbitrary
        <img src={icon} alt="" className="pf-prose-chip-website-icon" />
      ) : null}
      {displayLabel}
    </span>
  );

  function commit() {
    const trimmedUrl = url.trim();
    const trimmedLabel = label.trim();

    editor.tf.setNodes(
      {
        url: trimmedUrl,
        ...(trimmedLabel ? { label: trimmedLabel } : { label: undefined }),
      },
      { at: element }
    );

    if (trimmedUrl === '' && (element.url ?? '') === '') {
      editor.tf.removeNodes({ at: element });
    }
  }

  function close() {
    commit();
    setOpen(false);
  }

  return (
    <PlateElement
      {...props}
      className="inline-block"
      attributes={{
        ...props.attributes,
        contentEditable: false,
      }}
    >
      {readOnly ? (
        trigger
      ) : (
        <Popover
          open={open}
          onOpenChange={(next) => {
            if (!next) {
              close();
              return;
            }
            setOpen(next);
          }}
        >
          <PopoverTrigger asChild>
            <span
              className="cursor-pointer"
              data-selected={selected ? 'true' : undefined}
              onClick={() => setOpen(true)}
            >
              {trigger}
            </span>
          </PopoverTrigger>
          <PopoverContent className="w-72">
            <div className="flex flex-col gap-2">
              <label className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">URL</span>
                <input
                  autoFocus
                  value={url}
                  onChange={(event) => setUrl(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      close();
                    }
                  }}
                  placeholder="https://example.com"
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-muted-foreground text-xs">
                  Label (optional)
                </span>
                <input
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault();
                      close();
                    }
                  }}
                  placeholder={hostOf(url) || 'Website'}
                  className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                />
              </label>
            </div>
          </PopoverContent>
        </Popover>
      )}
      {props.children}
    </PlateElement>
  );
}
