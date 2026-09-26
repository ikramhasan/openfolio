import { getPhotos } from "./content";
import { byOrder } from "./data";
import { PhotoGrid } from "./photo-grid";

export async function Photos() {
  const { items } = await getPhotos();
  const photos = byOrder(items).filter((photo) => photo.url !== "");

  if (photos.length === 0) {
    return <p className="pf-meta pf-faint">Nothing here yet.</p>;
  }

  return <PhotoGrid photos={photos} />;
}
