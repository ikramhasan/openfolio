import Image from "next/image";
import Link from "next/link";
import { getIntro } from "./content";

export async function Masthead() {
  const intro = await getIntro();

  return (
    <header className="pt-8 pb-10 lg:pt-14 lg:pb-10 xl:pt-16">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-9">
        {intro.profileImage ? (
          <Image
            src={intro.profileImage}
            alt={`Portrait of ${intro.title}`}
            width={497}
            height={497}
            sizes="(min-width: 640px) 176px, 112px"
            priority
            className="pf-portrait size-28 shrink-0 rounded-full object-cover sm:size-44"
          />
        ) : null}

        <div className="min-w-0">
          <h1 className="pf-display text-balance">{intro.title}</h1>

          <p className="pf-standfirst mt-3.5 max-w-[42ch] text-pretty">
            {intro.bio}
          </p>

          {intro.resume ? (
            <Link href="/cv" className="pf-cta mt-5">
              View resume
            </Link>
          ) : null}
        </div>
      </div>
    </header>
  );
}
