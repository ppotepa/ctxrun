import { ConfigPluginSpec } from "../factory.js";

export interface CatalogEntry extends ConfigPluginSpec {
  /** Binary invoked when this preset is run, e.g. "terraform". */
  command: string;
  /**
   * Set to `false` for entries whose plugin already has a hand-composed
   * preset elsewhere (e.g. "git" needs base+git+ssh, not just base+git).
   * Defaults to true: one auto-generated `base + <tool>` preset per entry.
   */
  standalonePreset?: boolean;
}
