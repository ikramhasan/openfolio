import { createUploadUrl } from "./actions";

export const MAX_BYTES = 8 * 1024 * 1024;

export async function uploadFile(file: File): Promise<string> {
  const target = await createUploadUrl();
  if (!target) throw new Error("no upload url");

  const response = await fetch(target, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });

  if (!response.ok) throw new Error(`upload failed: ${response.status}`);

  const { storageId } = (await response.json()) as { storageId: string };
  return `storage:${storageId}`;
}

export function readImageSize(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();

    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("could not read image dimensions"));
    };

    image.src = url;
  });
}
