"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { Portfolio } from "../../_components/types";
import type { SaveResult } from "./actions";
import { getList, getPath, move, renumber, setList, setPath } from "./paths";

type SaveState = "idle" | "saving" | "saved" | "failed";

type ListOptions = { orderKey?: string };

type Draft = {
  portfolio: Portfolio;
  dirty: boolean;
  saveState: SaveState;
  saveMessage: string | null;
  previewFor: (token: string) => string;
  registerUpload: (token: string, url: string) => void;
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

function describe(result: SaveResult): string {
  if (!result.ok) return result.error;

  return result.changed.length === 0
    ? "Nothing to save — the content already matched."
    : `Saved. Refreshed ${result.changed.join(", ")}.`;
}

export function DraftProvider({
  initial,
  storageUrls,
  save: persist,
  children,
}: {
  initial: Portfolio;
  storageUrls: Record<string, string>;
  save: (portfolio: Portfolio) => Promise<SaveResult>;
  children: ReactNode;
}) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [previews, setPreviews] = useState(storageUrls);

  const edit = useCallback((change: (current: Portfolio) => Portfolio) => {
    setSaveState((state) => (state === "saving" ? state : "idle"));
    setSaveMessage(null);
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
      saveMessage,

      previewFor: (token) => previews[token] ?? "",
      registerUpload: (token, url) => {
        setPreviews((current) => ({ ...current, [token]: url }));
      },

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
        setSaveMessage(null);

        persist(draft).then(
          (result) => {
            setSaveMessage(describe(result));

            if (!result.ok) {
              setSaveState("failed");
              return;
            }

            setSaved(draft);
            setSaveState("saved");
          },
          () => {
            setSaveState("failed");
            setSaveMessage("Could not reach the server. Try again.");
          },
        );
      },

      discard: () => {
        setDraft(saved);
        setSaveState("idle");
        setSaveMessage(null);
      },
    };
  }, [draft, saved, saveState, saveMessage, previews, edit, persist]);

  return (
    <DraftContext.Provider value={value}>{children}</DraftContext.Provider>
  );
}

export function useDraft(): Draft {
  const draft = useContext(DraftContext);
  if (!draft) throw new Error("useDraft must be used inside <DraftProvider>");
  return draft;
}
