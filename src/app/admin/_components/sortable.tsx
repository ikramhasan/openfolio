"use client";

import {
  closestCenter,
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  restrictToParentElement,
  restrictToVerticalAxis,
} from "@dnd-kit/modifiers";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { CSSProperties, ReactNode } from "react";
import { useId } from "react";

/**
 * Drag to reorder, with the keyboard as a first-class path: the handle is a real
 * button, so space lifts a row and the arrows move it.
 *
 * Ids have to be stable per row, not per position. The browser leaves `:hover` on
 * whichever element was under the pointer at release, so a row that keeps its DOM
 * node while its contents change would light up the wrong record.
 */

// Below this a press is a click, not a drag — the handle sits beside buttons.
const DRAG_THRESHOLD = 5;

export function SortableList({
  ids,
  onMove,
  className = "pf-rule divide-y",
  children,
}: {
  ids: string[];
  onMove: (from: number, to: number) => void;
  className?: string;
  children: ReactNode;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_THRESHOLD },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Without this dnd-kit names its `aria-describedby` target from a module-level
  // counter, which starts again on the client and so never matches the server.
  const contextId = useId();

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;

    const from = ids.indexOf(String(active.id));
    const to = ids.indexOf(String(over.id));
    if (from === -1 || to === -1) return;

    onMove(from, to);
  }

  return (
    <DndContext
      id={contextId}
      sensors={sensors}
      collisionDetection={closestCenter}
      modifiers={[restrictToVerticalAxis, restrictToParentElement]}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ol className={className}>{children}</ol>
      </SortableContext>
    </DndContext>
  );
}

export function SortableRow({
  id,
  label,
  children,
}: {
  id: string;
  /** Named in the handle's accessible label. */
  label: string;
  children: (handle: ReactNode) => ReactNode;
}) {
  const {
    attributes,
    isDragging,
    listeners,
    setActivatorNodeRef,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  // Only the vertical axis moves, so the full matrix would be noise.
  const style: CSSProperties = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
  };

  const handle = (
    <button
      type="button"
      ref={setActivatorNodeRef}
      aria-label={`Reorder ${label}`}
      className="pf-handle"
      {...attributes}
      {...listeners}
    >
      <GripIcon />
    </button>
  );

  return (
    <li
      ref={setNodeRef}
      style={style}
      data-dragging={isDragging || undefined}
      className="pf-sortable"
    >
      {children(handle)}
    </li>
  );
}

function GripIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 4h.01M6 8h.01M6 12h.01M10 4h.01M10 8h.01M10 12h.01" />
    </svg>
  );
}
