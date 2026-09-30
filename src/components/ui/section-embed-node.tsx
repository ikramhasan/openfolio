'use client';

import * as React from 'react';

import type { PlateElementProps } from 'platejs/react';

import {
  PlateElement,
  useFocused,
  useReadOnly,
  useSelected,
} from 'platejs/react';

import {
  type TSectionEmbedElement,
  embedLimit,
  sectionLabel,
} from '@/components/editor/plugins/section-embed-base-plugin';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

function SectionPreview({
  section,
  limit,
  label,
}: {
  section: string;
  limit: number | undefined;
  label: string;
}) {
  const frame = React.useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = React.useState<number | null>(null);
  const [failed, setFailed] = React.useState(false);
  const src = `/admin/preview/${section}/${limit ?? 'all'}`;

  React.useEffect(() => {
    const iframe = frame.current;
    if (!iframe) return;

    let observer: ResizeObserver | undefined;

    const measure = (loaded: boolean) => {
      const view = iframe.contentWindow as (Window & typeof globalThis) | null;
      const main = iframe.contentDocument?.querySelector(
        '[data-section-preview]'
      );
      if (!view || !main) {
        if (loaded) setFailed(true);
        return;
      }

      setFailed(false);
      observer?.disconnect();
      observer = new view.ResizeObserver(() => {
        setHeight(Math.ceil(main.getBoundingClientRect().height));
      });
      observer.observe(main);
    };

    const onLoad = () => measure(true);

    if (
      iframe.contentDocument?.readyState === 'complete' &&
      iframe.contentWindow?.location.href !== 'about:blank'
    ) {
      onLoad();
    }
    iframe.addEventListener('load', onLoad);

    return () => {
      iframe.removeEventListener('load', onLoad);
      observer?.disconnect();
    };
  }, [src]);

  return (
    <div inert className="relative select-none">
      {height === null || failed ? (
        <p className="pf-meta pf-faint py-6">
          {failed
            ? `Could not load the ${label.toLowerCase()} preview.`
            : `Loading ${label.toLowerCase()}…`}
        </p>
      ) : null}
      <iframe
        ref={frame}
        src={src}
        title={`${label} preview`}
        tabIndex={-1}
        className="pointer-events-none block w-full border-0"
        style={{ height: failed ? 0 : (height ?? 0) }}
      />
    </div>
  );
}

export function SectionEmbedElement(
  props: PlateElementProps<TSectionEmbedElement>
) {
  const { editor, element } = props;
  const readOnly = useReadOnly();
  const selected = useSelected();
  const focused = useFocused();
  const [open, setOpen] = React.useState(false);
  const limit = embedLimit(element.limit);
  const [draft, setDraft] = React.useState(limit ? String(limit) : '');
  const label = sectionLabel(element.section);

  React.useEffect(() => {
    if (!open) return;
    setDraft(limit ? String(limit) : '');
  }, [open, limit]);

  React.useEffect(() => {
    if (readOnly || !element.prompt) return;

    const frame = requestAnimationFrame(() => setOpen(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  function commit() {
    const next = embedLimit(Number.parseInt(draft, 10));

    if (element.prompt) {
      editor.tf.unsetNodes('prompt', { at: element });
    }

    if (next === limit) return;

    if (next) {
      editor.tf.setNodes({ limit: next }, { at: element });
    } else {
      editor.tf.unsetNodes('limit', { at: element });
    }
  }

  function close() {
    commit();
    setOpen(false);
  }

  return (
    <PlateElement
      {...props}
      className="pf-prose-block pf-prose-section"
      attributes={{
        ...props.attributes,
        contentEditable: false,
      }}
    >
      <div
        className={cn(
          'rounded-md',
          selected && focused && 'ring-2 ring-ring ring-offset-4'
        )}
      >
        {readOnly ? null : (
          <div className="mb-4 flex items-center justify-between gap-3">
            <span className="text-muted-foreground text-xs">
              {label} section
            </span>

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
                <Button type="button" variant="outline" size="xs">
                  {limit ? `Showing ${limit}` : 'Showing all'}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                className="w-64"
                onFocusOutside={(event) => event.preventDefault()}
              >
                <div className="flex flex-col gap-2">
                  <label className="flex flex-col gap-1">
                    <span className="text-muted-foreground text-xs">
                      Items to show
                    </span>
                    <input
                      autoFocus
                      type="number"
                      min={1}
                      step={1}
                      inputMode="numeric"
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault();
                          close();
                        }
                      }}
                      placeholder="All"
                      className="h-8 rounded-md border border-input bg-transparent px-2 text-sm"
                    />
                  </label>
                  <span className="text-muted-foreground text-xs">
                    {element.section === 'experience'
                      ? 'Leave empty to show every role. The timeline always shows your whole career.'
                      : 'Leave empty to show every item.'}
                  </span>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}

        <SectionPreview
          section={element.section}
          limit={limit}
          label={label}
        />
      </div>
      {props.children}
    </PlateElement>
  );
}
