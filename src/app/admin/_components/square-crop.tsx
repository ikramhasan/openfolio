"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

const MAX_EDGE = 1024;

export function SquareCrop({
  file,
  onCancel,
  onConfirm,
}: {
  file: File;
  onCancel: () => void;
  onConfirm: (cropped: File) => void;
}) {
  const [source, setSource] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const area = useRef<Area | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSource(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    area.current = pixels;
  }, []);

  async function confirm() {
    if (!area.current) return;

    setBusy(true);
    setError(null);

    try {
      onConfirm(await cropToSquare(file, area.current));
    } catch {
      setError("Could not crop that image. Try another.");
      setBusy(false);
    }
  }

  return (
    <div className="pf-crop-backdrop">
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Crop to a square"
        className="pf-crop-panel"
      >
        <div className="pf-crop-stage">
          {source ? (
            <Cropper
              image={source}
              crop={crop}
              zoom={zoom}
              aspect={1}
              minZoom={1}
              maxZoom={4}
              showGrid={false}
              restrictPosition
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          ) : null}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="pf-column shrink-0">Zoom</span>
          <input
            type="range"
            min={1}
            max={4}
            step={0.01}
            value={zoom}
            aria-label="Zoom"
            onChange={(event) => setZoom(Number(event.target.value))}
            className="min-w-0 flex-1"
          />
        </div>

        <p className="pf-meta pf-faint mt-3">
          Drag to reposition. The portrait is saved as a square.
        </p>

        {error ? (
          <output className="pf-meta pf-strong mt-2 block">{error}</output>
        ) : null}

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="pf-button-quiet"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void confirm()}
            disabled={busy || !source}
            className="pf-button-quiet disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy ? "Cropping…" : "Use photograph"}
          </button>
        </div>
      </div>
    </div>
  );
}

async function cropToSquare(file: File, area: Area): Promise<File> {
  const bitmap = await createImageBitmap(file, {
    imageOrientation: "from-image",
  });

  const edge = Math.min(Math.round(area.width), MAX_EDGE);
  const canvas = document.createElement("canvas");
  canvas.width = edge;
  canvas.height = edge;

  const context = canvas.getContext("2d");
  if (!context) throw new Error("no 2d context");

  context.imageSmoothingQuality = "high";
  context.drawImage(
    bitmap,
    area.x,
    area.y,
    area.width,
    area.height,
    0,
    0,
    edge,
    edge,
  );
  bitmap.close();

  const type = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, type, 0.92);
  });

  if (!blob) throw new Error("could not encode crop");

  return new File([blob], renamed(file.name, type), { type });
}

function renamed(name: string, type: string): string {
  const stem = name.replace(/\.[^.]+$/, "") || "portrait";
  return `${stem}-square.${type === "image/png" ? "png" : "jpg"}`;
}
