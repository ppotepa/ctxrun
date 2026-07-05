import { CtxPlugin } from "../context/types.js";
import { basePlugin } from "./base.js";
import { gitPlugin } from "./git.js";
import { ghPlugin } from "./gh.js";
import { sshPlugin } from "./ssh.js";
import { codexPlugin } from "./codex.js";
import { copilotPlugin } from "./copilot.js";
import { geminiPlugin } from "./gemini.js";
import { claudePlugin } from "./claude.js";
import { npmPlugin } from "./npm.js";
import { cargoPlugin } from "./cargo.js";
import { dockerPlugin } from "./docker.js";
import { kubectlPlugin } from "./kubectl.js";
import { awsPlugin } from "./aws.js";
import { gcloudPlugin } from "./gcloud.js";
import { pythonPlugin } from "./python.js";
import { createConfigPlugin } from "./factory.js";
import { catalog } from "./catalog.js";

const handWrittenPlugins: CtxPlugin[] = [
  basePlugin,
  gitPlugin,
  ghPlugin,
  sshPlugin,
  codexPlugin,
  copilotPlugin,
  geminiPlugin,
  claudePlugin,
  npmPlugin,
  cargoPlugin,
  dockerPlugin,
  kubectlPlugin,
  awsPlugin,
  gcloudPlugin,
  pythonPlugin
];

// Everyday CLI tools that only need a declarative env/checks spec are
// generated from src/plugins/catalog.ts instead of being hand-written.
const catalogPlugins: CtxPlugin[] = catalog.map((entry) => createConfigPlugin(entry));

export const builtInPlugins: CtxPlugin[] = [...handWrittenPlugins, ...catalogPlugins];
