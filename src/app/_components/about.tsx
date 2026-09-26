import { getAbout } from "./content";
import { ProseBody } from "./prose-body";

export async function About() {
  const { bio } = await getAbout();

  return (
    <div className="max-w-[44rem]">
      <ProseBody value={bio} />
    </div>
  );
}
