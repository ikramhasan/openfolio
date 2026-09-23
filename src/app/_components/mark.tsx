import Image from "next/image";

export function Mark({ src }: { src: string }) {
  return (
    <span className="pf-mark inline-flex size-4 shrink-0 items-center justify-center rounded-[2px]">
      <span className="relative size-3">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            sizes="12px"
            className="object-contain"
          />
        ) : null}
      </span>
    </span>
  );
}
