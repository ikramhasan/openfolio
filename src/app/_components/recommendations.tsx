import Image from "next/image";
import { getRecommendations } from "./content";

export async function Recommendations() {
  const { items } = await getRecommendations();

  return (
    <ul className="pf-rule divide-y">
      {items.map((item) => (
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
              {item.author.image ? (
                <Image
                  src={item.author.image}
                  alt=""
                  width={64}
                  height={64}
                  sizes="28px"
                  className="pf-rule size-7 shrink-0 rounded-full border object-cover"
                />
              ) : null}
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
