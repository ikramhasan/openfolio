import Image from "next/image";
import Link from "next/link";
import { getIntro } from "./content";

export async function Masthead() {
  const intro = await getIntro();
  const words = intro.title.trim().split(/\s+/);
  const last = words.pop();

  return (
    <header className="pt-10 pb-6 lg:pt-16 lg:pb-8 xl:pt-20">
      <h1 className="pf-display">
        {words.length ? `${words.join(" ")} ` : null}
        <span className="whitespace-nowrap">
          {last}
          {intro.profileImage ? (
            <Image
              src={intro.profileImage}
              alt=""
              width={497}
              height={497}
              sizes="(min-width: 1024px) 112px, 80px"
              priority
              className="pf-portrait pf-display-portrait"
            />
          ) : null}
        </span>
      </h1>

      <p className="pf-standfirst mt-5 max-w-[38ch] text-pretty">{intro.bio}</p>

      {intro.resume ? (
        <Link href="/cv" className="pf-cta mt-7">
          View resume
        </Link>
      ) : null}
    </header>
  );
}
