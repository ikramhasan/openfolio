import Image from "next/image";
import { getRecommendations } from "./content";
import { hostOf } from "./data";

function sourceLabel(url: string): string {
  const host = hostOf(url);
  return host.endsWith("linkedin.com") ? "View on LinkedIn" : `View on ${host}`;
}

export async function Recommendations() {
  const { items } = await getRecommendations();

  return (
    <ul className="pf-rule divide-y border-t">
      {items.map((item) => (
        <li key={item.title} className="py-8 sm:py-10">
          <figure className="grid gap-y-5 sm:grid-cols-[11rem_minmax(0,1fr)] sm:gap-x-10">
            <blockquote className="pf-testimonial relative max-w-[62ch] text-pretty sm:col-start-2 sm:row-start-1">
              <span aria-hidden="true" className="pf-testimonial-mark">
                “
              </span>
              {item.body.trim()}
              <span aria-hidden="true">”</span>
            </blockquote>

            <figcaption className="flex items-start gap-3 sm:col-start-1 sm:row-start-1 sm:flex-col sm:gap-3.5">
              {item.author.image ? (
                <Image
                  src={item.author.image}
                  alt=""
                  width={88}
                  height={88}
                  sizes="44px"
                  className="pf-portrait size-11 shrink-0 rounded-full object-cover"
                />
              ) : null}

              <span className="block min-w-0">
                <span className="pf-title block">{item.author.name}</span>
                <span className="pf-meta pf-faint mt-0.5 block text-pretty">
                  {item.author.bio}
                </span>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="pf-link pf-meta pf-muted mt-2.5 inline-block"
                  >
                    {sourceLabel(item.url)}
                  </a>
                ) : null}
              </span>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
