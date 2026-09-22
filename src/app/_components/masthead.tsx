import Image from "next/image";
import { sections } from "./data";

const intro = sections.intro;

/** Portrait, name, bio — the only block that persists across sections. */
export function Masthead() {
  return (
    <header className="pt-8 pb-10 lg:pt-14 lg:pb-10 xl:pt-16">
      <Image
        src={intro.profileImage}
        alt={`Portrait of ${intro.title}`}
        width={497}
        height={497}
        sizes="64px"
        priority
        className="pf-rule size-16 rounded-full border object-cover"
      />

      <h1 className="pf-display mt-7">{intro.title}</h1>

      <p className="pf-standfirst mt-4 max-w-[38ch] text-pretty">
        {intro.bio}.
      </p>
    </header>
  );
}
