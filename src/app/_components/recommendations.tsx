import Image from "next/image";
import { sections } from "./data";

const recommendations = sections.recommendations;

/**
 * Quoted records, attributed beneath and linking to the source.
 *
 * Not cards: the testimonials differ hugely in length, so boxes would leave one
 * padded with empty space.
 */
export function Recommendations() {
  return (
    <ul className="pf-rule divide-y">
      {recommendations.items.map((item) => (
        <li key={item.title}>
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="pf-row -mx-3 block px-3 py-4"
          >
            <span className="pf-quote block max-w-[72ch] text-pretty">
              {item.body.trim()}
            </span>

            <span className="mt-4 flex items-center gap-2.5">
              <Image
                src={item.author.image}
                alt=""
                width={64}
                height={64}
                sizes="28px"
                className="pf-rule size-7 shrink-0 rounded-full border object-cover"
              />
              <span className="pf-meta">
                <span className="pf-strong">{item.author.name}</span>
                {" — "}
                {item.author.bio}
              </span>
              <span aria-hidden="true" className="pf-row-arrow pf-meta ml-auto">
                ↗
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
