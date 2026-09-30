import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { getProjects, getWritten } from "./content";
import { byOrder } from "./data";
import type { ProjectsSection } from "./types";
import { readPath, slugOf } from "./writing";

type Project = ProjectsSection["items"][number];

const STATUS_TAGS = new Set(["unmaintained"]);

function destination(link: string): string | null {
  try {
    const { hostname, pathname } = new URL(link);
    const host = hostname.replace(/^www\./, "");
    if (host === "github.com" && pathname.split("/").filter(Boolean).length) {
      return "GitHub";
    }
    return host;
  } catch {
    return null;
  }
}

function ProjectLink({
  href,
  internal,
  className,
  children,
}: {
  href: string | null;
  internal: boolean;
  className: string;
  children: ReactNode;
}) {
  if (!href) return <div className={className}>{children}</div>;

  if (internal) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {children}
    </a>
  );
}

function ProjectItem({
  project,
  href,
  internal,
}: {
  project: Project;
  href: string | null;
  internal: boolean;
}) {
  const status = project.tags.find((tag) => STATUS_TAGS.has(tag.toLowerCase()));
  const stack = project.tags
    .filter((tag) => !STATUS_TAGS.has(tag.toLowerCase()))
    .map((tag) => tag.toLowerCase())
    .join(", ");
  const where = internal ? "Case study" : destination(project.link);

  return (
    <li className="pf-project" data-unmaintained={status ? "true" : undefined}>
      <ProjectLink
        href={href}
        internal={internal}
        className="pf-row -mx-3 flex gap-4 px-3 py-6 sm:gap-5"
      >
        <span className="pf-logo pf-app-icon relative block size-11 shrink-0">
          {project.logo ? (
            <Image
              src={project.logo}
              alt=""
              fill
              sizes="44px"
              className="object-cover"
            />
          ) : null}
        </span>

        <span className="block min-w-0 max-w-[68ch]">
          <span className="pf-role-title block">{project.title}</span>

          <span className="pf-meta mt-0.5 flex flex-wrap gap-x-2.5">
            {where ? <span className="pf-faint">{where}</span> : null}
            {status ? (
              <span className="pf-muted">
                {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
              </span>
            ) : null}
          </span>

          <span className="pf-body mt-2 block">
            {project.description.trim()}
          </span>

          {stack ? (
            <span className="pf-meta pf-faint mt-2 block">{stack}</span>
          ) : null}
        </span>
      </ProjectLink>
    </li>
  );
}

export async function Projects({ limit }: { limit?: number } = {}) {
  const [{ items }, written] = await Promise.all([
    getProjects(),
    getWritten("projects"),
  ]);

  const native = new Set(written);
  const listed = byOrder(items).slice(0, limit);

  return (
    <ul className="pf-rule divide-y border-t">
      {listed.map((project) => {
        const slug = slugOf(project);
        const here = native.has(slug);

        return (
          <ProjectItem
            key={project.title}
            project={project}
            href={here ? readPath("projects", slug) : project.link || null}
            internal={here}
          />
        );
      })}
    </ul>
  );
}
