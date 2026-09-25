import { getAbout } from "./content";
import { ProseBody } from "./prose-body";
import { Strip } from "./strip";

export async function About() {
  const { bio } = await getAbout();

  return (
    <div className="max-w-[36rem]">
      <Strip />

      <div className="mt-8">
        <ProseBody value={bio} />
      </div>
    </div>
  );
}
