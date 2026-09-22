import { sections } from "./_components/data";
import { Footer } from "./_components/footer";
import { Masthead } from "./_components/masthead";
import { Panel } from "./_components/panel";
import {
  defaultTabId,
  navItems,
  pageSections,
  sectionTitle,
} from "./_components/sections";
import { Tabs } from "./_components/tabs";

/**
 * The portfolio.
 *
 * A sticky index rail on the left, one section at a time on the right. Clicking a
 * rail item swaps the panel beside it rather than scrolling the page.
 *
 * The persistent header is only the portrait, name and bio. Everything that reads
 * as content — the current role, the links, the photo strip, the skills table —
 * lives in the About panel, so switching to a section shows that section rather
 * than a header taller than its content.
 *
 * Panels are rendered here, on the server, and handed to the client `Tabs`
 * component as nodes — so adding a section never pulls its code into the client
 * bundle. Sections themselves are registered in `_components/sections.tsx`;
 * nothing here needs to change to add one.
 */
export default function Home() {
  const panels = pageSections.map((entry) => ({
    id: entry.id,
    node: (
      <Panel title={sectionTitle(entry)} note={entry.note} aside={entry.aside}>
        {entry.body}
      </Panel>
    ),
  }));

  return (
    <Tabs
      items={navItems}
      panels={panels}
      defaultId={defaultTabId}
      name={sections.intro.title}
      header={<Masthead />}
      footer={<Footer />}
    />
  );
}
