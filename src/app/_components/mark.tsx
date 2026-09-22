import Image from "next/image";

/**
 * Small inline mark used beside skills, roles and institutions.
 *
 * Always in full colour. Decorative only — the name it belongs to is always
 * adjacent as text, so the image carries an empty alt.
 */
export function Mark({ src }: { src: string }) {
  return (
    <span className="pf-mark inline-flex size-4 shrink-0 items-center justify-center rounded-[2px]">
      <span className="relative size-3">
        <Image src={src} alt="" fill sizes="12px" className="object-contain" />
      </span>
    </span>
  );
}
