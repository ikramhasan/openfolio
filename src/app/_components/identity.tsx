import Image from "next/image";
import { getIntro } from "./content";

export async function Identity() {
  const { title, profileImage } = await getIntro();

  return (
    <div className="hidden min-w-0 items-center gap-2.5 pb-7 lg:flex">
      {profileImage ? (
        <Image
          src={profileImage}
          alt={`Portrait of ${title}`}
          width={497}
          height={497}
          sizes="32px"
          priority
          className="pf-portrait size-8 shrink-0 rounded-full object-cover"
        />
      ) : null}

      <span className="pf-title min-w-0 truncate">{title}</span>
    </div>
  );
}
