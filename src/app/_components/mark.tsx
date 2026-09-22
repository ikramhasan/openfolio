import Image from "next/image";

/** Small inline logo beside roles and institutions. Decorative, so empty alt. */
export function Mark({ src }: { src: string }) {
  return (
    <span className="pf-mark inline-flex size-4 shrink-0 items-center justify-center rounded-[2px]">
      <span className="relative size-3">
        <Image src={src} alt="" fill sizes="12px" className="object-contain" />
      </span>
    </span>
  );
}
