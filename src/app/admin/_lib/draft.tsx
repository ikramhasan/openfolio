"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Portfolio } from "../../_components/data";
import { getList, getPath, move, renumber, setList, setPath } from "./paths";
import { repository } from "./repository";

/**
 * The working copy: one portfolio value, plus the last saved one to compare it
 * against.
 */

type SaveState = "idle" | "saving" | "saved" | "failed";

/** Lists whose records carry their own sort field are renumbered after a change. */
type ListOptions = { orderKey?: string };

type Draft = {
  portfolio: Portfolio;
  dirty: boolean;
  saveState: SaveState;
  read: (path: string) => unknown;
  readList: (path: string) => unknown[];
  setField: (path: string, value: unknown) => void;
  addRecord: (path: string, blank: unknown, options?: ListOptions) => void;
  removeRecord: (path: string, index: number, options?: ListOptions) => void;
  moveRecord: (
    path: string,
    from: number,
    to: number,
    options?: ListOptions,
  ) => void;
  save: () => void;
  discard: () => void;
};

const DraftContext = createContext<Draft | null>(null);

function ordered(list: unknown[], options?: ListOptions): unknown[] {
  return options?.orderKey ? renumber(list, options.orderKey) : list;
}

export function DraftProvider({
  initial,
  children,
}: {
  initial: Portfolio;
  children: ReactNode;
}) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const edit = useCallback((change: (current: Portfolio) => Portfolio) => {
    // An edit mid-save must not return the dock to idle: that would re-enable
    // Save and let a second write overtake the first.
    setSaveState((state) => (state === "saving" ? state : "idle"));
    setDraft(change);
  }, []);

  const value = useMemo<Draft>(() => {
    const editList = (
      path: string,
      change: (list: unknown[]) => unknown[],
      options?: ListOptions,
    ) => {
      edit((current) =>
        setList(current, path, (list) => ordered(change(list), options)),
      );
    };

    return {
      portfolio: draft,
      dirty: draft !== saved,
      saveState,

      read: (path) => getPath(draft, path),
      readList: (path) => getList(draft, path),

      setField: (path, next) => {
        edit((current) =>
          getPath(current, path) === next
            ? current
            : setPath(current, path, next),
        );
      },

      addRecord: (path, blank, options) => {
        editList(path, (list) => [...list, blank], options);
      },

      removeRecord: (path, index, options) => {
        editList(path, (list) => list.filter((_, at) => at !== index), options);
      },

      moveRecord: (path, from, to, options) => {
        editList(path, (list) => move(list, from, to), options);
      },

      save: () => {
        setSaveState("saving");

        // The draft can change while this is in flight; comparing against what was
        // actually sent leaves those later edits dirty.
        repository.save(draft).then(
          () => {
            setSaved(draft);
            setSaveState("saved");
          },
          () => setSaveState("failed"),
        );
      },

      discard: () => {
        setDraft(saved);
        setSaveState("idle");
      },
    };
  }, [draft, saved, saveState, edit]);

  return (
    <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
  );
}

export function useDraft(): Draft {
  const draft = useContext(DraftContext);
  if (!draft) throw new Error("useDraft must be used inside <DraftProvider>");
  return draft;
}
