import { type Portfolio, portfolio } from "../../_components/data";

/**
 * The seam between the editor and storage — the only place that knows where the
 * content comes from.
 *
 * There is no backend yet: `load` hands back the bundled JSON and `save` resolves
 * without writing. Replacing the two implementations is the whole wiring job;
 * `load` is already awaited on the server (`admin/layout.tsx`) and `save` is
 * called from the client, so a real one needs a server action or a route handler.
 */

export type PortfolioRepository = {
  load(): Promise<Portfolio>;
  save(next: Portfolio): Promise<void>;
};

export const repository: PortfolioRepository = {
  async load() {
    return portfolio;
  },

  async save(_next) {},
};
