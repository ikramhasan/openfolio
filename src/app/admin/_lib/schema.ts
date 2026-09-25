import Award01Icon from "@hugeicons/core-free-icons/Award01Icon";
import Briefcase01Icon from "@hugeicons/core-free-icons/Briefcase01Icon";
import Doc01Icon from "@hugeicons/core-free-icons/Doc01Icon";
import Folder02Icon from "@hugeicons/core-free-icons/Folder02Icon";
import GitForkIcon from "@hugeicons/core-free-icons/GitForkIcon";
import GraduationCapIcon from "@hugeicons/core-free-icons/GraduationCapIcon";
import IdCardIcon from "@hugeicons/core-free-icons/IdCardIcon";
import LayoutBottomIcon from "@hugeicons/core-free-icons/LayoutBottomIcon";
import Mail01Icon from "@hugeicons/core-free-icons/Mail01Icon";
import MusicNote01Icon from "@hugeicons/core-free-icons/MusicNote01Icon";
import QuoteUpIcon from "@hugeicons/core-free-icons/QuoteUpIcon";
import Sorting04Icon from "@hugeicons/core-free-icons/Sorting04Icon";
import ToolsIcon from "@hugeicons/core-free-icons/ToolsIcon";
import UserCircleIcon from "@hugeicons/core-free-icons/UserCircleIcon";
import YoutubeIcon from "@hugeicons/core-free-icons/YoutubeIcon";
import type { IconSvgElement } from "@hugeicons/react";
import { WRITE_BASE, type WritableSection } from "../../_components/writing";

export type FieldKind =
  | "text"
  | "textarea"
  | "url"
  | "image"
  | "number"
  | "date"
  | "tags"
  | "lines";

export type Field = {
  key: string;
  label: string;
  kind: FieldKind;
  hint?: string;
  wide?: boolean;
  from?: string;
  suggest?: boolean;
  fill?: "github";
};

export type RecordSchema = {
  summaryKey: string;
  fields: Field[];
  blank: Record<string, unknown>;
};

export type RecordPage = {
  basePath: string;
  label: string;
};

function writeRoute(section: WritableSection): RecordPage {
  return { basePath: `${WRITE_BASE}/${section}`, label: "Write" };
}

export type Block =
  | { kind: "fields"; label: string; base: string; fields: Field[] }
  | { kind: "richText"; label: string; note?: string }
  | {
      kind: "records";
      label: string;
      path: string;
      addLabel: string;
      record: RecordSchema;
      note?: string;
      orderKey?: string;
      sortable?: false;
      page?: RecordPage;
    }
  | {
      kind: "order";
      label: string;
      path: string;
      excludes?: string[];
    };

export type AdminGroup = {
  id: string;
  label: string;
  slug?: string;
  title: string;
  note?: string;
  icon: IconSvgElement;
  blocks: Block[];
};

const HEADING_FIELDS: Field[] = [
  { key: "title", label: "Heading", kind: "text" },
  {
    key: "note",
    label: "Subtitle",
    kind: "text",
    wide: true,
    hint: "Sits under the heading. Leave empty for none.",
  },
  {
    key: "navLabel",
    label: "Rail label",
    kind: "text",
    hint: "Defaults to the heading.",
  },
];

function heading(id: string): Block {
  return {
    kind: "fields",
    label: "Heading",
    base: `sections.${id}`,
    fields: HEADING_FIELDS,
  };
}

const LINK_RECORD: RecordSchema = {
  summaryKey: "title",
  fields: [
    { key: "title", label: "Label", kind: "text" },
    {
      key: "site",
      label: "Key",
      kind: "text",
      hint: "Identifies the network.",
    },
    { key: "url", label: "URL", kind: "url", wide: true },
  ],
  blank: { order: 0, site: "", title: "", url: "" },
};

const ACTION_RECORD: RecordSchema = {
  summaryKey: "label",
  fields: [
    { key: "label", label: "Label", kind: "text" },
    {
      key: "type",
      label: "Type",
      kind: "text",
      hint: "`calendar` books a Cal.com meeting instead of opening a URL.",
    },
    { key: "url", label: "URL", kind: "url", wide: true },
    { key: "calendar.username", label: "Cal.com user", kind: "text" },
    { key: "calendar.namespace", label: "Cal.com event", kind: "text" },
  ],
  blank: {
    label: "",
    type: "",
    url: "",
    calendar: { namespace: "", username: "" },
  },
};

export const ADMIN_GROUPS: AdminGroup[] = [
  {
    id: "profile",
    label: "Profile",
    icon: IdCardIcon,
    title: "Profile",
    note: "The masthead, the photographs and the links that follow you everywhere.",
    blocks: [
      {
        kind: "fields",
        label: "Site",
        base: "site",
        fields: [
          { key: "title", label: "Browser title", kind: "text", wide: true },
          {
            key: "description",
            label: "Meta description",
            kind: "textarea",
            wide: true,
          },
        ],
      },
      {
        kind: "fields",
        label: "Masthead",
        base: "sections.intro",
        fields: [
          { key: "title", label: "Name", kind: "text" },
          { key: "profileImage", label: "Portrait", kind: "image" },
          {
            key: "bio",
            label: "Bio",
            kind: "textarea",
            wide: true,
            hint: "One sentence. The site adds the full stop.",
          },
        ],
      },
      {
        kind: "records",
        label: "Photo strip",
        path: "sections.intro.headingImages",
        addLabel: "Add photograph",
        note: "The first is the lead frame; the rest sit in a row beneath it.",
        record: {
          summaryKey: "alt",
          fields: [
            { key: "url", label: "Image", kind: "image", wide: true },
            { key: "alt", label: "Alt text", kind: "text", wide: true },
          ],
          blank: { url: "", alt: "" },
        },
      },
    ],
  },
  {
    id: "about",
    label: "About",
    icon: UserCircleIcon,
    title: "About",
    note: "The heading sits above the bio; the bio itself is rich text, rendered on the site exactly as written here. Use the website chip to link a company or site inline.",
    blocks: [heading("about"), { kind: "richText", label: "Bio" }],
  },
  {
    id: "experience",
    label: "Experience",
    icon: Briefcase01Icon,
    title: "Experience",
    blocks: [
      heading("experience"),
      {
        kind: "records",
        label: "Roles",
        path: "sections.experience.items",
        addLabel: "Add role",
        orderKey: "order",
        note: "About names the first four roles in order, so adding or removing one needs an edit to `_components/about.tsx`. Write gives a role a page of its own, at its title.",
        page: writeRoute("experience"),
        record: {
          summaryKey: "title",
          fields: [
            { key: "title", label: "Role", kind: "text" },
            { key: "company", label: "Company", kind: "text" },
            { key: "logo", label: "Logo", kind: "image", from: "url" },
            { key: "location", label: "Location", kind: "text" },
            {
              key: "dateRange",
              label: "Dates",
              kind: "text",
              hint: "`October, 2022 - Present`. A trailing `(Contract)` is shown as a qualifier.",
            },
            { key: "url", label: "URL", kind: "url" },
            {
              key: "details",
              label: "Bullets",
              kind: "lines",
              wide: true,
              hint: "One per line.",
            },
          ],
          blank: {
            company: "",
            dateRange: "",
            details: [],
            location: "",
            logo: "",
            order: 0,
            title: "",
            url: null,
          },
        },
      },
    ],
  },
  {
    id: "projects",
    label: "Projects",
    icon: Folder02Icon,
    title: "Projects",
    blocks: [
      heading("projects"),
      {
        kind: "records",
        label: "Projects",
        path: "sections.projects.items",
        addLabel: "Add project",
        orderKey: "order",
        note: "Write gives a project a page of its own, at its title; the rest link straight out.",
        page: writeRoute("projects"),
        record: {
          summaryKey: "title",
          fields: [
            { key: "title", label: "Title", kind: "text" },
            { key: "logo", label: "Logo", kind: "image", from: "link" },
            { key: "link", label: "URL", kind: "url", wide: true },
            {
              key: "tags",
              label: "Tags",
              kind: "tags",
              wide: true,
              hint: "Comma separated. Shown lower-cased.",
            },
            {
              key: "description",
              label: "Description",
              kind: "textarea",
              wide: true,
            },
          ],
          blank: {
            description: "",
            link: "",
            logo: "",
            order: 0,
            tags: [],
            title: "",
          },
        },
      },
    ],
  },
  {
    id: "tools",
    label: "Tools",
    icon: ToolsIcon,
    title: "Tools I use",
    note: "Grouped on the site by category, in the order the categories first appear here — so dragging a row orders the groups as well.",
    blocks: [
      heading("tools"),
      {
        kind: "records",
        label: "Tools",
        path: "sections.tools.items",
        addLabel: "Add tool",
        orderKey: "order",
        record: {
          summaryKey: "title",
          fields: [
            { key: "title", label: "Name", kind: "text" },
            {
              key: "category",
              label: "Category",
              kind: "text",
              suggest: true,
              hint: "Reuse the same wording to file tools together.",
            },
            { key: "url", label: "URL", kind: "url", wide: true },
            {
              key: "icon",
              label: "Icon",
              kind: "image",
              wide: true,
              from: "url",
              hint: "Take the site's own favicon, paste a URL, or upload a file.",
            },
          ],
          blank: { order: 0, title: "", category: "", url: "", icon: "" },
        },
      },
    ],
  },
  {
    id: "music",
    label: "Music",
    icon: MusicNote01Icon,
    title: "Music",
    note: "One Spotify player per link, which supplies the title, artist and artwork on the site — the two fields here are just so you can tell the rows apart. Thirty seconds for a visitor who is not signed in, the whole track for one who is.",
    blocks: [
      heading("music"),
      {
        kind: "records",
        label: "Tracks",
        path: "sections.music.items",
        addLabel: "Add track",
        orderKey: "order",
        record: {
          summaryKey: "title",
          fields: [
            { key: "title", label: "Track", kind: "text" },
            { key: "artist", label: "Artist", kind: "text" },
            {
              key: "url",
              label: "Spotify link",
              kind: "url",
              wide: true,
              hint: "Share → Copy link, from the track, album or playlist. A link anywhere else cannot be played.",
            },
          ],
          blank: { order: 0, title: "", artist: "", url: "" },
        },
      },
    ],
  },
  {
    id: "articles",
    label: "Articles",
    icon: Doc01Icon,
    title: "Articles",
    blocks: [
      heading("articles"),
      {
        kind: "fields",
        label: "View all",
        base: "sections.articles.viewAll",
        fields: [
          { key: "label", label: "Label", kind: "text" },
          { key: "url", label: "URL", kind: "url" },
        ],
      },
      {
        kind: "records",
        label: "Posts",
        path: "sections.articles.items",
        addLabel: "Add post",
        sortable: false,
        note: "Shown newest first, from the publish date — there is nothing to drag. Write gives a post a page here rather than a link out.",
        page: writeRoute("articles"),
        record: {
          summaryKey: "title",
          fields: [
            { key: "title", label: "Title", kind: "text", wide: true },
            {
              key: "slug",
              label: "Slug",
              kind: "text",
              wide: true,
              hint: "The post's own page. Left empty it follows the title.",
            },
            { key: "url", label: "URL", kind: "url", wide: true },
            { key: "publishedAt", label: "Published", kind: "date" },
            {
              key: "readTimeMinutes",
              label: "Read time (min)",
              kind: "number",
            },
            { key: "views", label: "Views", kind: "number" },
            { key: "excerpt", label: "Excerpt", kind: "textarea", wide: true },
          ],
          blank: {
            title: "",
            slug: "",
            url: "",
            publishedAt: "",
            readTimeMinutes: 1,
            views: 0,
            excerpt: null,
          },
        },
      },
    ],
  },
  {
    id: "youtubeVideos",
    label: "Video",
    icon: YoutubeIcon,
    slug: "videos",
    title: "Videos",
    blocks: [
      heading("youtubeVideos"),
      {
        kind: "records",
        label: "Videos",
        path: "sections.youtubeVideos.items",
        addLabel: "Add video",
        orderKey: "order",
        record: {
          summaryKey: "title",
          fields: [
            { key: "title", label: "Title", kind: "text", wide: true },
            { key: "url", label: "URL", kind: "url", wide: true },
            { key: "thumbnail", label: "Still", kind: "image", wide: true },
          ],
          blank: { order: 0, thumbnail: "", title: "", url: "" },
        },
      },
    ],
  },
  {
    id: "education",
    label: "Education",
    icon: GraduationCapIcon,
    title: "Education",
    blocks: [
      heading("education"),
      {
        kind: "records",
        label: "Qualifications",
        path: "sections.education.items",
        addLabel: "Add qualification",
        record: {
          summaryKey: "title",
          fields: [
            { key: "title", label: "Qualification", kind: "text", wide: true },
            { key: "institution", label: "Institution", kind: "text" },
            { key: "logo", label: "Logo", kind: "image", from: "url" },
            { key: "location", label: "Location", kind: "text" },
            {
              key: "dateRange",
              label: "Dates",
              kind: "text",
              hint: "`2019 - 2022`.",
            },
            { key: "url", label: "URL", kind: "url", wide: true },
            {
              key: "description",
              label: "Description",
              kind: "textarea",
              wide: true,
            },
          ],
          blank: {
            dateRange: "",
            description: null,
            institution: "",
            location: "",
            logo: "",
            title: "",
            url: null,
          },
        },
      },
    ],
  },
  {
    id: "openSource",
    label: "Open source",
    icon: GitForkIcon,
    slug: "open-source",
    title: "Open source",
    note: "One address per contribution: fetch it and GitHub supplies the title, the repository, its stars and whether it landed. What it answers is stored, so a row is a snapshot — fetch again to bring one up to date.",
    blocks: [
      heading("openSource"),
      {
        kind: "records",
        label: "Contributions",
        path: "sections.openSource.items",
        addLabel: "Add contribution",
        sortable: false,
        note: "Shown newest first, from the date GitHub gives — there is nothing to drag.",
        record: {
          summaryKey: "title",
          fields: [
            {
              key: "url",
              label: "URL",
              kind: "url",
              wide: true,
              fill: "github",
              hint: "`github.com/owner/repo/pull/123`, or an issue.",
            },
          ],
          blank: {
            title: "",
            url: "",
            repo: "",
            number: 0,
            avatar: "",
            state: "",
            date: "",
            stars: 0,
          },
        },
      },
    ],
  },
  {
    id: "awards",
    label: "Awards",
    icon: Award01Icon,
    title: "Awards",
    blocks: [
      heading("awards"),
      {
        kind: "records",
        label: "Awards",
        path: "sections.awards.items",
        addLabel: "Add award",
        orderKey: "order",
        note: "Write gives an award a page of its own, at its title; the rest link straight out.",
        page: writeRoute("awards"),
        record: {
          summaryKey: "title",
          fields: [
            { key: "title", label: "Award", kind: "text", wide: true },
            { key: "organization", label: "Organisation", kind: "text" },
            { key: "logo", label: "Logo", kind: "image" },
            { key: "date", label: "Date", kind: "date" },
            { key: "url", label: "URL", kind: "url" },
            {
              key: "description",
              label: "Description",
              kind: "textarea",
              wide: true,
            },
          ],
          blank: {
            date: "",
            description: "",
            logo: "",
            order: 0,
            organization: "",
            title: "",
            url: null,
          },
        },
      },
    ],
  },
  {
    id: "recommendations",
    label: "References",
    icon: QuoteUpIcon,
    slug: "references",
    title: "Recommendations",
    blocks: [
      heading("recommendations"),
      {
        kind: "records",
        label: "Testimonials",
        path: "sections.recommendations.items",
        addLabel: "Add testimonial",
        record: {
          summaryKey: "title",
          fields: [
            {
              key: "title",
              label: "Reference",
              kind: "text",
              hint: "Admin only.",
            },
            { key: "url", label: "URL", kind: "url" },
            { key: "author.name", label: "Author", kind: "text" },
            { key: "author.image", label: "Author photo", kind: "image" },
            {
              key: "author.bio",
              label: "Author title",
              kind: "text",
              wide: true,
            },
            { key: "body", label: "Quote", kind: "textarea", wide: true },
          ],
          blank: {
            author: { bio: "", image: "", name: "" },
            body: "",
            title: "",
            url: "",
          },
        },
      },
    ],
  },
  {
    id: "contact",
    label: "Contact",
    icon: Mail01Icon,
    title: "Contact",
    note: "The row of links at the foot of every page: the networks first, then the actions.",
    blocks: [
      {
        kind: "records",
        label: "Links",
        path: "footer.socialLinks",
        addLabel: "Add link",
        orderKey: "order",
        record: LINK_RECORD,
      },
      {
        kind: "records",
        label: "Actions",
        path: "footer.actions",
        addLabel: "Add action",
        record: ACTION_RECORD,
      },
    ],
  },
  {
    id: "footer",
    label: "Footer",
    icon: LayoutBottomIcon,
    title: "Footer",
    note: "The signature and the small print beneath it.",
    blocks: [
      {
        kind: "fields",
        label: "Signature",
        base: "footer.signature",
        fields: [
          {
            key: "owner",
            label: "Signed by",
            kind: "text",
            hint: "Read out to screen readers.",
          },
          {
            key: "image",
            label: "Signature file",
            kind: "image",
            hint: "Drawn as a mask, so any solid SVG takes the ink colour.",
          },
        ],
      },
      {
        kind: "fields",
        label: "Small print",
        base: "footer",
        fields: [
          { key: "copyright", label: "Copyright", kind: "text", wide: true },
        ],
      },
    ],
  },
  {
    id: "order",
    label: "Order",
    icon: Sorting04Icon,
    title: "Section order",
    note: "The order the rail and the routes follow. About is pinned first, and a section left unplaced is appended after the rest.",
    blocks: [
      {
        kind: "order",
        label: "Sections",
        path: "sectionOrder",
        excludes: ["intro", "about", "skills", "connect"],
      },
    ],
  },
];

export function groupSegments(group: AdminGroup): string[] {
  return group === ADMIN_GROUPS[0] ? [] : [group.slug ?? group.id];
}

export function groupPath(group: AdminGroup): string {
  return ["/admin", ...groupSegments(group)].join("/");
}

export const groupByPath = new Map(
  ADMIN_GROUPS.map((group) => [groupPath(group), group]),
);

export const adminNavItems = ADMIN_GROUPS.map((group) => ({
  href: groupPath(group),
  label: group.label,
  icon: group.icon,
}));
