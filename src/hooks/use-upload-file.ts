"use client";

import * as React from "react";
import { toast } from "sonner";
import { createUploadUrl, storageUrl } from "@/app/admin/_lib/actions";

/**
 * The editor's uploader, pointed at Convex storage.
 *
 * The bytes go straight from the browser to the deployment, which hands back a
 * storage id; the URL that id resolves to is what goes into the node, and the save
 * turns it back into a `storage:<id>` reference (`convex/lib/body.ts`). Both halves
 * are refused to anyone but the admin, in Convex.
 *
 * Progress is reported in two steps rather than by byte: `fetch` cannot observe an
 * upload's progress, and an editor-sized image is one round trip.
 */

export type UploadedFile = {
  key: string;
  name: string;
  size: number;
  type: string;
  url: string;
};

type UseUploadFileProps = {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
};

/** Convex takes files up to 20 MB through an upload URL without complaint. */
const MAX_BYTES = 20 * 1024 * 1024;

export function useUploadFile({
  onUploadComplete,
  onUploadError,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = React.useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = React.useState<File>();
  const [progress, setProgress] = React.useState(0);
  const [isUploading, setIsUploading] = React.useState(false);

  const uploadFile = React.useCallback(
    async (file: File) => {
      setIsUploading(true);
      setUploadingFile(file);
      setProgress(10);

      try {
        if (file.size > MAX_BYTES) {
          throw new Error("That file is over the 20 MB limit.");
        }

        const target = await createUploadUrl();
        if (!target) throw new Error("Signed out. Sign in and try again.");

        const response = await fetch(target, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });

        if (!response.ok) throw new Error("The upload was refused.");

        const { storageId } = (await response.json()) as { storageId: string };
        setProgress(90);

        const url = await storageUrl(storageId);
        if (!url) throw new Error("The file uploaded but cannot be read back.");

        const uploaded: UploadedFile = {
          key: storageId,
          name: file.name,
          size: file.size,
          type: file.type,
          url,
        };

        setUploadedFile(uploaded);
        setProgress(100);
        onUploadComplete?.(uploaded);

        return uploaded;
      } catch (error) {
        toast.error(getErrorMessage(error));
        onUploadError?.(error);

        return undefined;
      } finally {
        setProgress(0);
        setIsUploading(false);
        setUploadingFile(undefined);
      }
    },
    [onUploadComplete, onUploadError],
  );

  return {
    isUploading,
    progress,
    uploadedFile,
    uploadFile,
    uploadingFile,
  };
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return "The upload failed. Try again.";
}

export function showErrorToast(error: unknown) {
  return toast.error(getErrorMessage(error));
}
