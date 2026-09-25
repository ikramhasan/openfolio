import Image from "next/image";
import { getIntro } from "./content";

export async function Masthead() {
  const intro = await getIntro();

  return (
    <header className="pt-8 pb-10 lg:pt-14 lg:pb-10 xl:pt-16">
      {intro.profileImage ? (
        <Image
          src={intro.profileImage}
          alt={`Portrait of ${intro.title}`}
          width={497}
          height={497}
          sizes="64px"
          priority
          className="pf-portrait size-16 rounded-full object-cover"
        />
      ) : null}

      <h1 className="pf-display mt-7 text-balance">{intro.title}</h1>

      <p className="pf-standfirst mt-4 max-w-[38ch] text-pretty">{intro.bio}</p>
    </header>
  );
}
