import { v } from "convex/values";
import { Scrypt } from "lucia";
import { PDFDocument, StandardFonts } from "pdf-lib";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  internalQuery,
  type MutationCtx,
  type QueryCtx,
} from "./_generated/server";
import {
  ABOUT_BIO,
  ARTICLES,
  AWARDS,
  BODIES,
  EDUCATION,
  EXPERIENCE,
  HEADERS,
  IMAGES,
  INTRO,
  MUSIC,
  NEWSLETTER,
  OPEN_SOURCE,
  PHOTOS,
  PROJECTS,
  RECOMMENDATIONS,
  SECTION_ORDER,
  SEED_ADMIN,
  SITE,
  SKILLS,
  SOCIAL_LINKS,
  TOOLS,
  VIDEOS,
} from "./lib/seedData";
import { BODY_TABLES, type WritableSection } from "./lib/writable";

async function isEmpty(ctx: QueryCtx | MutationCtx): Promise<boolean> {
  const user = await ctx.db.query("users").first();
  const site = await ctx.db.query("site").first();
  return user === null && site === null;
}

function faviconUrl(url: string): string {
  return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=128`;
}

export const empty = internalQuery({
  args: {},
  returns: v.boolean(),
  handler: (ctx) => isEmpty(ctx),
});

export const preview = internalAction({
  args: {},
  returns: v.string(),
  handler: async (ctx) => {
    if (!(await ctx.runQuery(internal.seed.empty, {}))) {
      return "The deployment already has content, so nothing was seeded.";
    }

    const secret = await new Scrypt().hash(SEED_ADMIN.password);

    const stored = await Promise.all(
      Object.entries(IMAGES).map(async ([key, { width, height }]) => {
        try {
          const response = await fetch(
            `https://picsum.photos/seed/${key}/${width}/${height}`,
          );
          if (!response.ok) return null;
          const storageId = await ctx.storage.store(await response.blob());
          return [key, storageId] as const;
        } catch {
          return null;
        }
      }),
    );

    const images = Object.fromEntries(stored.filter((entry) => entry !== null));

    let resume: Id<"_storage"> | undefined;
    try {
      resume = await ctx.storage.store(
        new Blob([await resumePdf()], { type: "application/pdf" }),
      );
    } catch {
      resume = undefined;
    }

    await ctx.runMutation(internal.seed.insert, { secret, images, resume });

    return `Seeded. Sign in at /signin as ${SEED_ADMIN.email} with the password "${SEED_ADMIN.password}".`;
  },
});

export const insert = internalMutation({
  args: {
    secret: v.string(),
    images: v.record(v.string(), v.id("_storage")),
    resume: v.optional(v.id("_storage")),
  },
  returns: v.null(),
  handler: async (ctx, { secret, images, resume }) => {
    if (!(await isEmpty(ctx))) return null;

    const image = (key: string) =>
      images[key]
        ? { kind: "file" as const, storageId: images[key] }
        : undefined;

    const userId = await ctx.db.insert("users", {
      name: SEED_ADMIN.name,
      email: SEED_ADMIN.email,
      isAdmin: true,
    });
    await ctx.db.insert("authAccounts", {
      userId,
      provider: "password",
      providerAccountId: SEED_ADMIN.email,
      secret,
    });

    await ctx.db.insert("site", SITE);

    for (const header of HEADERS) {
      await ctx.db.insert("sectionHeaders", header);
    }
    await ctx.db.insert("sectionOrder", { keys: SECTION_ORDER });

    await ctx.db.insert("intro", {
      bio: INTRO.bio,
      profileImage: image("portrait"),
      ...(resume
        ? { resume: { kind: "file" as const, storageId: resume } }
        : {}),
    });
    await ctx.db.insert("aboutBio", {
      value: ABOUT_BIO,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("connect", { newsletter: NEWSLETTER });

    for (const placement of ["intro", "footer"] as const) {
      for (const [order, link] of SOCIAL_LINKS.entries()) {
        await ctx.db.insert("socialLinks", { ...link, order, placement });
      }
    }

    for (const [order, skill] of SKILLS.entries()) {
      await ctx.db.insert("skills", {
        ...skill,
        order,
        icon: faviconUrl(skill.url),
      });
    }

    for (const [order, { logo, ...item }] of EXPERIENCE.entries()) {
      await ctx.db.insert("experience", { ...item, order, logo: image(logo) });
    }

    for (const [order, { logo, ...item }] of PROJECTS.entries()) {
      await ctx.db.insert("projects", { ...item, order, logo: image(logo) });
    }

    for (const [order, { cover, ...item }] of ARTICLES.entries()) {
      await ctx.db.insert("articles", {
        ...item,
        order,
        coverImage: image(cover),
      });
    }

    for (const [order, { thumbnail, ...item }] of VIDEOS.entries()) {
      await ctx.db.insert("youtubeVideos", {
        ...item,
        order,
        thumbnail: image(thumbnail),
      });
    }

    for (const [order, { key, ...item }] of PHOTOS.entries()) {
      const photo = image(key);
      if (photo)
        await ctx.db.insert("photos", { ...item, order, image: photo });
    }

    for (const [order, item] of TOOLS.entries()) {
      await ctx.db.insert("tools", { ...item, order });
    }

    for (const [order, item] of MUSIC.entries()) {
      await ctx.db.insert("music", { ...item, order });
    }

    for (const [order, { avatar, ...item }] of OPEN_SOURCE.entries()) {
      await ctx.db.insert("openSource", {
        ...item,
        order,
        avatar: image(avatar),
      });
    }

    for (const [order, { logo, ...item }] of EDUCATION.entries()) {
      await ctx.db.insert("education", { ...item, order, logo: image(logo) });
    }

    for (const [order, { logo, ...item }] of AWARDS.entries()) {
      await ctx.db.insert("awards", { ...item, order, logo: image(logo) });
    }

    for (const [order, { author, ...item }] of RECOMMENDATIONS.entries()) {
      await ctx.db.insert("recommendations", {
        ...item,
        order,
        author: { ...author, image: image(author.image) },
      });
    }

    for (const [section, { slug, value }] of Object.entries(BODIES)) {
      await ctx.db.insert(BODY_TABLES[section as WritableSection], {
        slug,
        value,
        updatedAt: Date.now(),
      });
    }

    return null;
  },
});

async function resumePdf(): Promise<Uint8Array<ArrayBuffer>> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(`${SEED_ADMIN.name} CV`);
  pdf.setAuthor(SEED_ADMIN.name);

  const page = pdf.addPage([595, 842]);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  let y = 780;
  const line = (text: string, size = 11, font = regular, gap = 6) => {
    page.drawText(text, { x: 56, y, size, font });
    y -= size + gap;
  };

  line(SEED_ADMIN.name, 24, bold, 10);
  line(`Software engineer · ${SEED_ADMIN.email}`, 11, regular, 24);

  line("Experience", 14, bold, 10);
  for (const role of EXPERIENCE) {
    line(`${role.title}, ${role.company}`, 11, bold, 4);
    line(role.dateRange, 10, regular, 4);
    for (const detail of role.details) line(`•  ${detail}`, 10, regular, 4);
    y -= 10;
  }

  y -= 6;
  line("Education", 14, bold, 10);
  for (const school of EDUCATION) {
    line(`${school.title}, ${school.institution}`, 11, bold, 4);
    line(school.dateRange, 10, regular, 12);
  }

  const bytes = await pdf.save();
  return new Uint8Array(bytes);
}
