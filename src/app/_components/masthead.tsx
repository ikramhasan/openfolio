import Image from "next/image";
import { sections } from "./data";

const intro = sections.intro;

/**
 * The masthead: portrait, name, bio. Nothing else.
 *
 * This is the only block that persists across sections, so it carries just the
 * identity — who this is and what they do in one line. Everything that used to
 * sit here and reads as *content* (the current role, the links, the photo strip)
 * moved into the About panel, so navigating to a section does not leave a growing
 * header pinned above the section you actually asked for.
 *
 * The top padding is tighter below `lg`, where the rail is a sticky strip
 * directly above this rather than a column beside it.
 */
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
