import { CatalogEntry } from "./types.js";
import { languagesCatalog } from "./languages.js";
import { cloudCatalog } from "./cloud.js";
import { containersCatalog } from "./containers.js";
import { vcsCatalog } from "./vcs.js";
import { editorsCatalog } from "./editors.js";
import { databasesCatalog } from "./databases.js";
import { secretsCatalog } from "./secrets.js";
import { miscCatalog } from "./misc.js";
import { aiCatalog } from "./ai.js";

export type { CatalogEntry } from "./types.js";

/**
 * Data-driven catalog of everyday developer CLI tools, split by domain.
 * Each entry becomes both a plugin (via createConfigPlugin) and, unless
 * `standalonePreset` is `false`, a matching 1:1 preset (`base` + the tool's
 * own plugin). This keeps the long tail of tool integrations declarative
 * instead of ~100 near-identical hand-written files.
 *
 * Entries with no `env` only contribute `doctor` checks: the tool already
 * honors `HOME`/XDG_* from the `base` plugin, so there is nothing to patch,
 * but surfacing config presence is still useful diagnostically.
 */
export const catalog: CatalogEntry[] = [
  ...vcsCatalog,
  ...aiCatalog,
  ...languagesCatalog,
  ...cloudCatalog,
  ...containersCatalog,
  ...editorsCatalog,
  ...databasesCatalog,
  ...secretsCatalog,
  ...miscCatalog
];
