import type { Doc, TableNames } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { type ImageRef, parseImage } from "./images";
import { SECTION_KEYS, type SectionKey, type wirePortfolio } from "./wire";

/**
 * Writing the wire payload back into the section tables.
 *
 * Nothing here checks authorisation — `admin.save`, its only caller, does. Adding a
 * writer that skips that is the one way to open a hole in this file.
 */

export type Wire = typeof wirePortfolio.type;

type SingletonTable =
  | "site"
  | "intro"
  | "footer"
  | "connect"
  | "articlesMeta"
  | "sectionOrder";

/**
 * Upserts the single row of a one-document table. The schema cannot express the
 * constraint, so this is the only thing that inserts into these tables.
 */
export async function putSingleton<T extends SingletonTable>(
  ctx: MutationCtx,
  table: T,
  value: Omit<Doc<T>, "_id" | "_creationTime">,
): Promise<void> {
  const existing = await ctx.db.query(table).first();

  if (existing) {
    await ctx.db.replace(existing._id, value as never);
    return;
  }

  await ctx.db.insert(table, value as never);
}

/**
 * Rewrites a list table to exactly `rows`, in order. Existing documents are reused
 * positionally, so editing one record does not churn the ids of every record after
 * it. `order` is assigned from the array index: the array the editor sends *is*
 * the order.
 *
 * The rows are already validated — they came through an argument validator — and
 * the cast is to the table's own document type, which TypeScript cannot narrow
 * from a generic table name.
 */
async function replaceList<T extends TableNames>(
  ctx: MutationCtx,
  table: T,
  rows: Record<string, unknown>[],
): Promise<void> {
  const existing = await ctx.db.query(table).collect();
  existing.sort(
    (a, b) =>
      ((a as { order?: number }).order ?? 0) -
      ((b as { order?: number }).order ?? 0),
  );

  const shared = Math.min(existing.length, rows.length);

  for (let index = 0; index < shared; index += 1) {
    await ctx.db.replace(existing[index]._id, rows[index] as never);
  }

  for (let index = shared; index < rows.length; index += 1) {
    await ctx.db.insert(table, rows[index] as never);
  }

  for (let index = shared; index < existing.length; index += 1) {
    await ctx.db.delete(existing[index]._id);
  }
}

function optionalImage(token: string): ImageRef | undefined {
  return parseImage(token);
}

// -------------------------------------------------------------------- chrome

export async function writeSite(ctx: MutationCtx, next: Wire): Promise<void> {
  await putSingleton(ctx, "site", {
    title: next.site.title,
    description: next.site.description,
  });
}

/** Heading copy for every section, plus the rail's order. */
export async function writeHeaders(
  ctx: MutationCtx,
  next: Wire,
): Promise<void> {
  for (const key of SECTION_KEYS) {
    const { title, note, navLabel } = next.sections[key];
    const row = {
      key,
      title,
      ...(note ? { note } : {}),
      ...(navLabel ? { navLabel } : {}),
    };

    const existing = await ctx.db
      .query("sectionHeaders")
      .withIndex("key", (q) => q.eq("key", key))
      .unique();

    if (existing) await ctx.db.replace(existing._id, row);
    else await ctx.db.insert("sectionHeaders", row);
  }

  await putSingleton(ctx, "sectionOrder", { keys: next.sectionOrder });
}

export async function writeFooter(ctx: MutationCtx, next: Wire): Promise<void> {
  const { signature, socialLinks, actions, copyright } = next.footer;

  await putSingleton(ctx, "footer", {
    signature: {
      type: signature.type,
      owner: signature.owner,
      image: optionalImage(signature.image),
    },
    copyright,
    actions,
  });

  await replaceSocialLinks(ctx, "footer", socialLinks);
}

/**
 * `socialLinks` is one table for two lists, so a rewrite has to leave the other
 * placement alone: the positional reuse in `replaceList` cannot be used here.
 */
async function replaceSocialLinks(
  ctx: MutationCtx,
  placement: "intro" | "footer",
  links: Wire["footer"]["socialLinks"],
): Promise<void> {
  const existing = await ctx.db
    .query("socialLinks")
    .withIndex("placement_order", (q) => q.eq("placement", placement))
    .collect();

  const rows = links.map((link, order) => ({
    placement,
    order,
    site: link.site,
    title: link.title,
    url: link.url,
  }));

  const shared = Math.min(existing.length, rows.length);

  for (let index = 0; index < shared; index += 1) {
    await ctx.db.replace(existing[index]._id, rows[index]);
  }
  for (let index = shared; index < rows.length; index += 1) {
    await ctx.db.insert("socialLinks", rows[index]);
  }
  for (let index = shared; index < existing.length; index += 1) {
    await ctx.db.delete(existing[index]._id);
  }
}

// ------------------------------------------------------------------ sections

export async function writeSection(
  ctx: MutationCtx,
  key: SectionKey,
  next: Wire,
): Promise<void> {
  switch (key) {
    case "intro": {
      const section = next.sections.intro;

      await putSingleton(ctx, "intro", {
        bio: section.bio,
        profileImage: optionalImage(section.profileImage),
        actions: section.actions,
      });

      await replaceList(
        ctx,
        "headingImages",
        section.headingImages.flatMap((entry, order) => {
          const ref = parseImage(entry.url);
          return ref ? [{ order, image: ref, alt: entry.alt }] : [];
        }),
      );

      await replaceSocialLinks(ctx, "intro", section.socialLinks);
      return;
    }

    // Heading only; `writeHeaders` already stored it.
    case "about":
      return;

    case "skills":
      await replaceList(
        ctx,
        "skills",
        next.sections.skills.items.map((item, order) => ({
          order,
          icon: item.icon,
          level: item.level,
          title: item.title,
          url: item.url,
        })),
      );
      return;

    case "education":
      await replaceList(
        ctx,
        "education",
        next.sections.education.items.map((item, order) => ({
          order,
          title: item.title,
          institution: item.institution,
          location: item.location,
          logo: optionalImage(item.logo),
          dateRange: item.dateRange,
          description: item.description,
          url: item.url,
        })),
      );
      return;

    case "experience":
      await replaceList(
        ctx,
        "experience",
        next.sections.experience.items.map((item, order) => ({
          order,
          title: item.title,
          company: item.company,
          location: item.location,
          logo: optionalImage(item.logo),
          dateRange: item.dateRange,
          details: item.details,
          url: item.url,
        })),
      );
      return;

    case "youtubeVideos":
      await replaceList(
        ctx,
        "youtubeVideos",
        next.sections.youtubeVideos.items.map((item, order) => ({
          order,
          title: item.title,
          url: item.url,
          thumbnail: optionalImage(item.thumbnail),
        })),
      );
      return;

    case "articles": {
      const section = next.sections.articles;

      await replaceList(
        ctx,
        "articles",
        section.items.map((item, order) => ({
          order,
          title: item.title,
          slug: item.slug,
          url: item.url,
          coverImage: optionalImage(item.coverImage),
          publishedAt: item.publishedAt,
          readTimeMinutes: item.readTimeMinutes,
          views: item.views,
          ...(item.pinned === undefined ? {} : { pinned: item.pinned }),
          excerpt: item.excerpt,
        })),
      );

      await putSingleton(ctx, "articlesMeta", { viewAll: section.viewAll });
      return;
    }

    case "projects":
      await replaceList(
        ctx,
        "projects",
        next.sections.projects.items.map((item, order) => ({
          order,
          title: item.title,
          description: item.description,
          link: item.link,
          logo: optionalImage(item.logo),
          tags: item.tags,
        })),
      );
      return;

    case "tools":
      await replaceList(
        ctx,
        "tools",
        next.sections.tools.items.map((item, order) => ({
          order,
          title: item.title,
          category: item.category,
          url: item.url,
          icon: optionalImage(item.icon),
        })),
      );
      return;

    case "music":
      await replaceList(
        ctx,
        "music",
        next.sections.music.items.map((item, order) => ({
          order,
          url: item.url,
          title: item.title,
          artist: item.artist,
        })),
      );
      return;

    case "openSource":
      await replaceList(
        ctx,
        "openSource",
        next.sections.openSource.items.map((item, order) => ({
          order,
          title: item.title,
          url: item.url,
          repo: item.repo,
          number: item.number,
          avatar: optionalImage(item.avatar),
          state: item.state,
          date: item.date,
          stars: item.stars,
        })),
      );
      return;

    case "awards":
      await replaceList(
        ctx,
        "awards",
        next.sections.awards.items.map((item, order) => ({
          order,
          title: item.title,
          organization: item.organization,
          logo: optionalImage(item.logo),
          date: item.date,
          description: item.description,
          url: item.url,
        })),
      );
      return;

    case "recommendations":
      await replaceList(
        ctx,
        "recommendations",
        next.sections.recommendations.items.map((item, order) => ({
          order,
          title: item.title,
          url: item.url,
          body: item.body,
          author: {
            name: item.author.name,
            bio: item.author.bio,
            image: optionalImage(item.author.image),
          },
        })),
      );
      return;

    case "connect":
      await putSingleton(ctx, "connect", {
        newsletter: next.sections.connect.newsletter,
      });
      return;
  }
}
