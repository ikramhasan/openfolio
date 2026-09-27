export const SEED_ADMIN = {
  name: "John Doe",
  email: "john.doe@example.com",
  password: "password",
};

type Text = { text: string; bold?: boolean; italic?: boolean; code?: boolean };
type Inline = Text | { type: "a"; url: string; children: Text[] };

function p(...children: (Inline | string)[]) {
  return {
    type: "p",
    children: children.map((child) =>
      typeof child === "string" ? { text: child } : child,
    ),
  };
}

function h2(text: string) {
  return { type: "h2", children: [{ text }] };
}

function h3(text: string) {
  return { type: "h3", children: [{ text }] };
}

function quote(text: string) {
  return { type: "blockquote", children: [{ text }] };
}

function bullets(items: string[]) {
  return items.map((text) => ({
    type: "p",
    indent: 1,
    listStyleType: "disc",
    children: [{ text }],
  }));
}

function code(lang: string, lines: string[]) {
  return {
    type: "code_block",
    lang,
    children: lines.map((text) => ({
      type: "code_line",
      children: [{ text }],
    })),
  };
}

function link(url: string, text: string): Inline {
  return { type: "a", url, children: [{ text }] };
}

function body(...blocks: unknown[]): string {
  return JSON.stringify(blocks.flat());
}

export const SITE = {
  title: "John Doe",
  description:
    "John Doe is a software engineer who builds fast, friendly products for the web.",
};

export const HEADERS: {
  key: string;
  title: string;
  note?: string;
  navLabel?: string;
}[] = [
  { key: "intro", title: "John Doe" },
  { key: "about", title: "About", note: "A little about me." },
  { key: "skills", title: "Skills" },
  {
    key: "experience",
    title: "Experience",
    note: "Where I've worked and what I did there.",
  },
  {
    key: "projects",
    title: "Projects",
    note: "Things I've built on my own time.",
  },
  {
    key: "articles",
    title: "Writing",
    note: "Notes on building software.",
    navLabel: "Articles",
  },
  {
    key: "openSource",
    title: "Open Source",
    note: "Contributions to other people's projects.",
  },
  { key: "youtubeVideos", title: "Videos", note: "Talks and screencasts." },
  { key: "photos", title: "Photos", note: "From walks and trips." },
  { key: "tools", title: "Tools", note: "What I use every day." },
  { key: "music", title: "Music", note: "On repeat lately." },
  { key: "education", title: "Education" },
  { key: "awards", title: "Awards", note: "Recognition along the way." },
  {
    key: "recommendations",
    title: "References",
    note: "Kind words from people I've worked with.",
  },
  { key: "connect", title: "Stay in touch" },
];

export const SECTION_ORDER = [
  "experience",
  "projects",
  "articles",
  "openSource",
  "youtubeVideos",
  "photos",
  "tools",
  "music",
  "education",
  "awards",
  "recommendations",
];

export const INTRO = {
  bio: "I'm a software engineer in Springfield who builds fast, friendly products for the web.",
};

export const ABOUT_BIO = body(
  p(
    "I'm John, a software engineer with a soft spot for tools that make other people faster. I've spent the last eight years building web products, from tiny internal dashboards to apps used by millions.",
  ),
  p(
    "Right now I lead the platform team at ",
    link("https://example.com", "Example Corp"),
    ", where we keep the build fast and the deploys boring.",
  ),
  p(
    "Outside work I take photos, write about ",
    { text: "TypeScript", bold: true },
    ", and contribute to open source when I can.",
  ),
);

export const SOCIAL_LINKS = [
  { site: "github", title: "GitHub", url: "https://github.com/johndoe" },
  {
    site: "linkedin",
    title: "LinkedIn",
    url: "https://www.linkedin.com/in/johndoe",
  },
  { site: "x", title: "X", url: "https://x.com/johndoe" },
  { site: "email", title: "Email", url: "mailto:john.doe@example.com" },
];

export const NEWSLETTER = {
  inputLabel: "Get new articles in your inbox. No spam, unsubscribe anytime.",
  placeholder: "you@example.com",
  submitLabel: "Subscribe",
  loadingLabel: "Subscribing…",
  messages: {
    invalidEmail: "That doesn't look like an email address.",
    success: "Thanks! You're on the list.",
    error: "Something went wrong. Please try again.",
  },
};

export const SKILLS = [
  {
    title: "TypeScript",
    url: "https://www.typescriptlang.org",
    level: 5,
  },
  { title: "React", url: "https://react.dev", level: 5 },
  { title: "Node.js", url: "https://nodejs.org", level: 4 },
  { title: "PostgreSQL", url: "https://www.postgresql.org", level: 3 },
];

export const EXPERIENCE = [
  {
    title: "Staff Software Engineer",
    company: "Example Corp",
    location: "Springfield",
    logo: "logo-example-corp",
    dateRange: "Mar 2022 - Present",
    details: [
      "Lead the platform team of six engineers.",
      "Cut CI time from 25 to 7 minutes by caching builds across branches.",
      "Designed the preview environment every pull request now gets.",
    ],
    url: "https://example.com",
  },
  {
    title: "Senior Software Engineer",
    company: "Acme Inc.",
    location: "Shelbyville (Remote)",
    logo: "logo-acme",
    dateRange: "Jun 2019 - Feb 2022",
    details: [
      "Built the checkout flow used by two million customers a month.",
      "Migrated the web app from JavaScript to TypeScript.",
    ],
    url: "https://example.org",
  },
  {
    title: "Software Engineer",
    company: "Initech",
    location: "Capital City",
    logo: "logo-initech",
    dateRange: "Jul 2016 - May 2019",
    details: [
      "Shipped the first version of the customer dashboard.",
      "Wrote the internal component library.",
    ],
    url: "https://example.net",
  },
];

export const PROJECTS = [
  {
    title: "Tidy Tabs",
    description:
      "A browser extension that groups and sleeps your tabs so your laptop fan can rest.",
    link: "https://github.com/johndoe/tidy-tabs",
    logo: "logo-tidy-tabs",
    tags: ["TypeScript", "Chrome"],
  },
  {
    title: "Budget Buddy",
    description:
      "A small app for splitting shared expenses with friends, with no sign-up required.",
    link: "https://budget-buddy.example.com",
    logo: "logo-budget-buddy",
    tags: ["React", "Convex"],
  },
  {
    title: "Weatherline",
    description:
      "A command-line tool that prints tomorrow's forecast as a single line.",
    link: "https://github.com/johndoe/weatherline",
    logo: "logo-weatherline",
    tags: ["Rust", "CLI"],
  },
  {
    title: "Pixel Garden",
    description: "A tiny idle game about growing pixel-art plants.",
    link: "https://github.com/johndoe/pixel-garden",
    logo: "logo-pixel-garden",
    tags: ["Canvas", "Unmaintained"],
  },
];

export const ARTICLES = [
  {
    title: "Making CI Fast Again",
    slug: "making-ci-fast-again",
    url: "https://blog.example.com/making-ci-fast-again",
    cover: "cover-ci",
    publishedAt: "2026-06-12T00:00:00.000Z",
    readTimeMinutes: 8,
    views: 4210,
    pinned: true,
    excerpt:
      "How we cut our build from 25 minutes to 7 without buying bigger machines.",
  },
  {
    title: "A Gentle Introduction to TypeScript Generics",
    slug: "typescript-generics",
    url: "https://blog.example.com/typescript-generics",
    cover: "cover-generics",
    publishedAt: "2025-11-03T00:00:00.000Z",
    readTimeMinutes: 6,
    views: 12840,
    excerpt: "Generics explained with nothing but shopping lists.",
  },
  {
    title: "What I Learned Shipping a Checkout Flow",
    slug: "shipping-a-checkout-flow",
    url: "https://blog.example.com/shipping-a-checkout-flow",
    cover: "cover-checkout",
    publishedAt: "2024-04-20T00:00:00.000Z",
    readTimeMinutes: 11,
    views: 2395,
    excerpt: "Five lessons from building the page where money changes hands.",
  },
  {
    title: "Notes on Remote Work",
    slug: "notes-on-remote-work",
    url: "https://blog.example.com/notes-on-remote-work",
    cover: "cover-remote",
    publishedAt: "2023-01-15T00:00:00.000Z",
    readTimeMinutes: 4,
    views: 980,
    excerpt: null,
  },
];

export const VIDEOS = [
  {
    title: "Making CI Fast Again (Conference Talk)",
    url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    thumbnail: "thumb-ci-talk",
  },
  {
    title: "Building a Browser Extension in 20 Minutes",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    thumbnail: "thumb-extension",
  },
  {
    title: "TypeScript Generics, Live",
    url: "https://www.youtube.com/watch?v=9bZkp7q19f0",
    thumbnail: "thumb-generics",
  },
];

export const PHOTOS = [
  { key: "photo-harbor", alt: "Boats in a harbor", width: 1200, height: 800 },
  { key: "photo-forest", alt: "A forest path", width: 800, height: 1200 },
  { key: "photo-city", alt: "City lights at night", width: 1200, height: 900 },
  { key: "photo-coast", alt: "A rocky coastline", width: 1200, height: 800 },
  { key: "photo-cafe", alt: "Coffee on a table", width: 900, height: 1200 },
  { key: "photo-hills", alt: "Rolling hills", width: 1200, height: 675 },
];

export const TOOLS = [
  {
    title: "VS Code",
    category: "Development",
    url: "https://code.visualstudio.com",
  },
  { title: "Ghostty", category: "Development", url: "https://ghostty.org" },
  { title: "GitHub", category: "Development", url: "https://github.com" },
  { title: "Figma", category: "Design", url: "https://www.figma.com" },
  { title: "Excalidraw", category: "Design", url: "https://excalidraw.com" },
  { title: "Notion", category: "Productivity", url: "https://www.notion.so" },
  {
    title: "Raycast",
    category: "Productivity",
    url: "https://www.raycast.com",
  },
  {
    title: "Spotify",
    category: "Productivity",
    url: "https://open.spotify.com",
  },
];

export const MUSIC = [
  {
    url: "https://open.spotify.com/album/4m2880jivSbbyEGAKfITCa",
    title: "Random Access Memories",
    artist: "Daft Punk",
  },
  {
    url: "https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC",
    title: "Never Gonna Give You Up",
    artist: "Rick Astley",
  },
  {
    url: "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M",
    title: "Today's Top Hits",
    artist: "Spotify",
  },
];

export const OPEN_SOURCE = [
  {
    title: "Cache build outputs between workflow runs",
    url: "https://github.com/example-org/build-kit/pull/412",
    repo: "example-org/build-kit",
    number: 412,
    avatar: "avatar-example-org",
    state: "merged",
    date: "2026-05-02T00:00:00.000Z",
    stars: 8400,
  },
  {
    title: "Fix a crash when the config file is empty",
    url: "https://github.com/example-org/build-kit/pull/398",
    repo: "example-org/build-kit",
    number: 398,
    avatar: "avatar-example-org",
    state: "merged",
    date: "2026-02-18T00:00:00.000Z",
    stars: 8400,
  },
  {
    title: "Add a dark theme to the docs site",
    url: "https://github.com/sample-labs/docs-theme/pull/57",
    repo: "sample-labs/docs-theme",
    number: 57,
    avatar: "avatar-sample-labs",
    state: "open",
    date: "2026-08-30T00:00:00.000Z",
    stars: 1250,
  },
  {
    title: "Support custom date formats",
    url: "https://github.com/sample-labs/docs-theme/issues/41",
    repo: "sample-labs/docs-theme",
    number: 41,
    avatar: "avatar-sample-labs",
    state: "closed",
    date: "2025-10-09T00:00:00.000Z",
    stars: 1250,
  },
];

export const EDUCATION = [
  {
    title: "BSc in Computer Science",
    institution: "Springfield University",
    location: "Springfield",
    logo: "logo-springfield-university",
    dateRange: "Sep 2012 - Jun 2016",
    description:
      "Graduated with honours. Thesis on caching in distributed builds.",
    url: "https://example.edu",
  },
  {
    title: "High School Diploma",
    institution: "Springfield High School",
    location: "Springfield",
    logo: "logo-springfield-high",
    dateRange: "2008 - 2012",
    description: null,
    url: null,
  },
];

export const AWARDS = [
  {
    title: "Engineer of the Year",
    organization: "Example Corp",
    logo: "logo-example-corp",
    date: "2024-12-01T00:00:00.000Z",
    description:
      "For leading the move to preview environments for every pull request.",
    url: null,
  },
  {
    title: "First Place, Springfield Hackathon",
    organization: "Springfield Tech Meetup",
    logo: "logo-hackathon",
    date: "2018-10-01T00:00:00.000Z",
    description: "Built Budget Buddy in 24 hours with two friends.",
    url: "https://example.org/hackathon",
  },
];

export const RECOMMENDATIONS = [
  {
    title: "Jane Smith",
    url: "https://www.linkedin.com/in/janesmith",
    body: "John is the engineer you want on your hardest problem. He makes complicated systems simple and leaves every codebase better than he found it.",
    author: {
      name: "Jane Smith",
      bio: "VP of Engineering, Example Corp",
      image: "author-jane",
    },
  },
  {
    title: "Alex Johnson",
    url: "https://www.linkedin.com/in/alexjohnson",
    body: "Working with John was a masterclass in clear communication. He explains trade-offs so well that decisions almost make themselves.",
    author: {
      name: "Alex Johnson",
      bio: "Product Manager, Acme Inc.",
      image: "author-alex",
    },
  },
];

export const BODIES = {
  experience: {
    slug: "staff-software-engineer",
    value: body(
      p(
        "At Example Corp I lead the platform team. We own the build, the deploy pipeline and the preview environments every pull request gets.",
      ),
      h2("Making CI fast"),
      p(
        "When I joined, a build took 25 minutes. We now share a build cache across branches and run tests by affected package, so most builds finish in 7.",
      ),
      bullets([
        "Remote build cache shared across branches",
        "Tests run only for packages a change touches",
        "Preview deployments for every pull request",
      ]),
    ),
  },
  projects: {
    slug: "tidy-tabs",
    value: body(
      p(
        "Tidy Tabs started because my laptop fan would not stop spinning. It groups tabs by site and puts the ones you haven't touched in an hour to sleep.",
      ),
      h2("How it works"),
      p(
        "The extension listens for tab events and keeps a small index of when each tab was last active.",
      ),
      code("ts", [
        "chrome.tabs.onActivated.addListener(({ tabId }) => {",
        "  lastActive.set(tabId, Date.now());",
        "});",
      ]),
      h3("What's next"),
      p("Syncing groups between devices."),
    ),
  },
  articles: {
    slug: "making-ci-fast-again",
    value: body(
      p(
        "Our continuous integration took 25 minutes. Engineers batched changes to avoid waiting, which made every review bigger and slower. Here's how we got it down to 7.",
      ),
      h2("Measure first"),
      p(
        "We added timing to every step and found that half the time went to installing dependencies and rebuilding packages nobody had touched.",
      ),
      quote("The fastest build is the one you don't run."),
      h2("Cache everything"),
      p(
        "A shared, content-addressed cache meant a branch could reuse work from ",
        { text: "main", code: true },
        " instead of starting from scratch.",
      ),
      bullets([
        "Cache dependencies by lockfile hash",
        "Cache build outputs by input hash",
        "Run only the tests a change can affect",
      ]),
      h2("Results"),
      p(
        "Median build time went from 25 minutes to 7, and pull requests got smaller within a month.",
      ),
    ),
  },
  awards: {
    slug: "engineer-of-the-year",
    value: body(
      p(
        "In 2024 Example Corp named me Engineer of the Year for the preview environment project.",
      ),
      p(
        "Every pull request now gets its own copy of the app and its backend, so reviewers can click through a change instead of imagining it.",
      ),
    ),
  },
};

export const IMAGES: Record<string, { width: number; height: number }> = {
  portrait: { width: 497, height: 497 },
  "logo-example-corp": { width: 128, height: 128 },
  "logo-acme": { width: 128, height: 128 },
  "logo-initech": { width: 128, height: 128 },
  "logo-tidy-tabs": { width: 128, height: 128 },
  "logo-budget-buddy": { width: 128, height: 128 },
  "logo-weatherline": { width: 128, height: 128 },
  "logo-pixel-garden": { width: 128, height: 128 },
  "logo-springfield-university": { width: 128, height: 128 },
  "logo-springfield-high": { width: 128, height: 128 },
  "logo-hackathon": { width: 128, height: 128 },
  "avatar-example-org": { width: 96, height: 96 },
  "avatar-sample-labs": { width: 96, height: 96 },
  "author-jane": { width: 176, height: 176 },
  "author-alex": { width: 176, height: 176 },
  "cover-ci": { width: 1600, height: 840 },
  "cover-generics": { width: 1600, height: 840 },
  "cover-checkout": { width: 1600, height: 840 },
  "cover-remote": { width: 1600, height: 840 },
  "thumb-ci-talk": { width: 1280, height: 720 },
  "thumb-extension": { width: 1280, height: 720 },
  "thumb-generics": { width: 1280, height: 720 },
  ...Object.fromEntries(
    PHOTOS.map((photo) => [
      photo.key,
      { width: photo.width, height: photo.height },
    ]),
  ),
};
