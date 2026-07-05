import { CtxPlugin } from "../registry/types.js";
import { basePlugin } from "./core/base.js";
import { sshPlugin } from "./core/ssh.js";
import { createConfigPlugin } from "./factory.js";
import { catalog } from "./catalog/index.js";

// Only two plugins need genuinely custom logic (absolute paths derived from
// UserContext, conditional env based on process.env) - everything else is
// generated declaratively from the catalog.
const corePlugins: CtxPlugin[] = [basePlugin, sshPlugin];

const catalogPlugins: CtxPlugin[] = catalog.map((entry) => createConfigPlugin(entry));

export const builtInPlugins: CtxPlugin[] = [...corePlugins, ...catalogPlugins];
