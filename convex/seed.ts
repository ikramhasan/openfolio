import { v } from "convex/values";
import source from "../data/portfolio.json";
import { internalMutation } from "./_generated/server";
import { SECTION_KEYS } from "./lib/wire";
import { type Wire, writeAll } from "./lib/write";

/**
 * The one-off import of `data/portfolio.json`, which was the site's content before
 * there was a database.
 *
 * Internal, so it is reachable only from the CLI or the dashboard:
 *
 *     npx convex run seed:fromJson '{}'
 *
 * It overwrites every section, so running it again on a deployment that has been
 * edited discards those edits. The JSON is left in the repository as the record of
 * where the content came from; nothing reads it at runtime.
 */

type JsonAction = {
  label: string;
  type?: string;
  url?: string | null;
  calendar?: { namespace: string; username: string };
};

type JsonLink = { order: number; site: string; title: string; url: string };

type JsonHeader = { title: string; note?: string; navLabel?: string };

type Json = {
  site: { title: string; description: string };
  sectionOrder: string[];
  sections: {
    intro: JsonHeader & {
      bio: string;
      profileImage: string;
      headingImages: { url: string; alt: string }[];
      socialLinks: JsonLink[];
      actions: JsonAction[];
    };
    about: JsonHeader;
    skills: JsonHeader & {
      items: {
        icon: string;
        level: number;
        order: number;
        title: string;
        url: string;
      }[];
    };
    education: JsonHeader & {
      items: {
        dateRange: string;
        description: string | null;
        institution: string;
        location: string;
        logo: string;
        title: string;
        url: string | null;
      }[];
    };
    experience: JsonHeader & {
      items: {
        company: string;
        dateRange: string;
        details: string[];
        location: string;
        logo: string;
        order: number;
        title: string;
        url: string | null;
      }[];
    };
    youtubeVideos: JsonHeader & {
      items: { order: number; thumbnail: string; title: string; url: string }[];
    };
    articles: JsonHeader & {
      viewAll: { label: string; url: string };
      items: {
        title: string;
        slug: string;
        url: string;
        coverImage: string;
        publishedAt: string;
        readTimeMinutes: number;
        views: number;
        pinned?: boolean;
        excerpt: string | null;
      }[];
    };
    projects: JsonHeader & {
      items: {
        description: string;
        link: string;
        logo: string;
        order: number;
        tags: string[];
        title: string;
      }[];
    };
    awards: JsonHeader & {
      items: {
        date: string;
        description: string;
        logo: string;
        order: number;
        organization: string;
        title: string;
        url: string | null;
      }[];
    };
    recommendations: JsonHeader & {
      items: {
        author: { bio: string; image: string; name: string };
        body: string;
        title: string;
        url: string;
      }[];
    };
    connect: JsonHeader & {
      newsletter: {
        inputLabel: string;
        placeholder: string;
        submitLabel: string;
        loadingLabel: string;
        messages: { invalidEmail: string; success: string; error: string };
      };
    };
  };
  footer: {
    signature: { type: string; owner: string; image: string };
    socialLinks: JsonLink[];
    actions: JsonAction[];
    copyright: string;
  };
};

const json = source as unknown as Json;

function header(value: JsonHeader): JsonHeader {
  return {
    title: value.title,
    ...(value.note ? { note: value.note } : {}),
    ...(value.navLabel ? { navLabel: value.navLabel } : {}),
  };
}

// A calendar action carries no URL; the wire shape makes the field explicit.
function action(value: JsonAction) {
  return {
    label: value.label,
    ...(value.type ? { type: value.type } : {}),
    url: value.url ?? null,
    ...(value.calendar ? { calendar: value.calendar } : {}),
  };
}

function links(value: JsonLink[]) {
  return [...value]
    .sort((a, b) => a.order - b.order)
    .map((link, order) => ({
      order,
      site: link.site,
      title: link.title,
      url: link.url,
    }));
}

/** Records that carry their own sort field are read in that order, then renumbered. */
function ordered<T extends { order: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => a.order - b.order);
}

function toWire(): Wire {
  const s = json.sections;

  return {
    site: { title: json.site.title, description: json.site.description },
    sectionOrder: json.sectionOrder,
    sections: {
      intro: {
        ...header(s.intro),
        bio: s.intro.bio,
        profileImage: s.intro.profileImage,
        headingImages: s.intro.headingImages,
        socialLinks: links(s.intro.socialLinks),
        actions: s.intro.actions.map(action),
      },
      about: header(s.about),
      skills: {
        ...header(s.skills),
        items: ordered(s.skills.items).map((item, order) => ({
          order,
          icon: item.icon,
          level: item.level,
          title: item.title,
          url: item.url,
        })),
      },
      education: {
        ...header(s.education),
        items: s.education.items.map((item) => ({
          title: item.title,
          institution: item.institution,
          location: item.location,
          logo: item.logo,
          dateRange: item.dateRange,
          description: item.description,
          url: item.url,
        })),
      },
      experience: {
        ...header(s.experience),
        items: ordered(s.experience.items).map((item, order) => ({
          order,
          title: item.title,
          company: item.company,
          location: item.location,
          logo: item.logo,
          dateRange: item.dateRange,
          details: item.details,
          url: item.url,
        })),
      },
      youtubeVideos: {
        ...header(s.youtubeVideos),
        items: ordered(s.youtubeVideos.items).map((item, order) => ({
          order,
          title: item.title,
          url: item.url,
          thumbnail: item.thumbnail,
        })),
      },
      articles: {
        ...header(s.articles),
        viewAll: s.articles.viewAll,
        items: s.articles.items.map((item) => ({
          title: item.title,
          slug: item.slug,
          url: item.url,
          coverImage: item.coverImage,
          publishedAt: item.publishedAt,
          readTimeMinutes: item.readTimeMinutes,
          views: item.views,
          ...(item.pinned === undefined ? {} : { pinned: item.pinned }),
          excerpt: item.excerpt,
        })),
      },
      projects: {
        ...header(s.projects),
        items: ordered(s.projects.items).map((item, order) => ({
          order,
          title: item.title,
          description: item.description,
          link: item.link,
          logo: item.logo,
          tags: item.tags,
        })),
      },
      awards: {
        ...header(s.awards),
        items: ordered(s.awards.items).map((item, order) => ({
          order,
          title: item.title,
          organization: item.organization,
          logo: item.logo,
          date: item.date,
          description: item.description,
          url: item.url,
        })),
      },
      recommendations: {
        ...header(s.recommendations),
        items: s.recommendations.items.map((item) => ({
          title: item.title,
          url: item.url,
          body: item.body,
          author: {
            name: item.author.name,
            bio: item.author.bio,
            image: item.author.image,
          },
        })),
      },
      connect: {
        ...header(s.connect),
        newsletter: {
          inputLabel: s.connect.newsletter.inputLabel,
          placeholder: s.connect.newsletter.placeholder,
          submitLabel: s.connect.newsletter.submitLabel,
          loadingLabel: s.connect.newsletter.loadingLabel,
          messages: s.connect.newsletter.messages,
        },
      },
    },
    footer: {
      signature: json.footer.signature,
      socialLinks: links(json.footer.socialLinks),
      actions: json.footer.actions.map(action),
      copyright: json.footer.copyright,
    },
  };
}

export const fromJson = internalMutation({
  args: {},
  returns: v.object({ sections: v.number() }),
  handler: async (ctx) => {
    await writeAll(ctx, toWire());
    return { sections: SECTION_KEYS.length };
  },
});
