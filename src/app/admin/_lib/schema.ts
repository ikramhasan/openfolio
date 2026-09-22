/**
 * What the admin can edit, as data. A group is one rail item and one route; its
 * blocks are either loose fields, a list of records, or the section order.
 *
 * Paths are absolute from the portfolio root, which is what the draft store and a
 * patch endpoint both take. Nothing here may hold a function: the schema crosses
 * the server/client boundary as props.
 */

export type FieldKind =
  | "text"
  | "textarea"
  | "url"
  | "image"
  | "number"
  | "date"
  /** Comma separated at the input, `string[]` in the data. */
  | "tags"
  /** One per line at the input, `string[]` in the data. */
  | "lines";

export type Field = {
  /** Relative to the block's base, or to the record. */
  key: string;
  label: string;
  kind: FieldKind;
  hint?: string;
  /** Spans both columns of the field grid. */
  wide?: boolean;
};

export type RecordSchema = {
  /** Names a collapsed row. */
  summaryKey: string;
  fields: Field[];
  /** A new record, so every field has something to bind to. */
  blank: Record<string, unknown>;
};

/**
 * A record too large to edit in a row — an article body — is written on a page of
 * its own, addressed by one of its own fields.
 */
export type RecordPage = {
  basePath: string;
  /** The field that addresses the page. A record without it cannot be opened. */
  key: string;
  label: string;
};

export type Block =
  | { kind: "fields"; label: string; base: string; fields: Field[] }
  | {
      kind: "records";
      label: string;
      path: string;
      addLabel: string;
      record: RecordSchema;
      note?: string;
      /** The record's own sort field, rewritten on every list change. */
      orderKey?: string;
      /** Off where the site derives the order from the content itself. */
      sortable?: false;
      page?: RecordPage;
    }
  | {
      kind: "order";
      label: string;
      path: string;
    };

export type AdminGroup = {
  id: string;
  /** Rail wording. */
  label: string;
  /** URL segment. The first group answers for `/admin` itself. */
  slug?: string;
  title: string;
  note?: string;
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
    title: "About",
    note: "The panel's heading is the only copy here: its prose is written in `_components/about.tsx`, out of the roles in Experience.",
    blocks: [heading("about")],
  },
  {
    id: "experience",
    label: "Experience",
    title: "Experience",
    blocks: [
      heading("experience"),
      {
        kind: "records",
        label: "Roles",
        path: "sections.experience.items",
        addLabel: "Add role",
        orderKey: "order",
        note: "About names the first four roles in order, so adding or removing one needs an edit to `_components/about.tsx`.",
        record: {
          summaryKey: "title",
          fields: [
            { key: "title", label: "Role", kind: "text" },
            { key: "company", label: "Company", kind: "text" },
            { key: "logo", label: "Logo", kind: "image" },
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
    title: "Projects",
    blocks: [
      heading("projects"),
      {
        kind: "records",
        label: "Projects",
        path: "sections.projects.items",
        addLabel: "Add project",
        orderKey: "order",
        record: {
          summaryKey: "title",
          fields: [
            { key: "title", label: "Title", kind: "text" },
            { key: "logo", label: "Logo", kind: "image" },
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
    id: "articles",
    label: "Articles",
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
        note: "Shown newest first, from the publish date — there is nothing to drag. The body is written on each post's own page.",
        page: { basePath: "/admin/articles", key: "slug", label: "Write" },
        record: {
          summaryKey: "title",
          fields: [
            { key: "title", label: "Title", kind: "text", wide: true },
            {
              key: "slug",
              label: "Slug",
              kind: "text",
              wide: true,
              hint: "Addresses the post's own page. Changing it breaks the old link.",
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
            { key: "logo", label: "Logo", kind: "image" },
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
    id: "awards",
    label: "Awards",
    title: "Awards",
    blocks: [
      heading("awards"),
      {
        kind: "records",
        label: "Awards",
        path: "sections.awards.items",
        addLabel: "Add award",
        orderKey: "order",
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
    title: "Section order",
    note: "The order the rail and the routes follow. About is pinned first.",
    blocks: [
      {
        kind: "order",
        label: "Sections",
        path: "sectionOrder",
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

export const adminNavItems = ADMIN_GROUPS.map((group, index) => ({
  href: groupPath(group),
  label: group.label,
  index: String(index + 1).padStart(2, "0"),
}));
