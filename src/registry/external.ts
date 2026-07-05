import { readFileSync } from "node:fs";
import { CtxPlugin, Preset } from "./types.js";
import { createConfigPlugin, ConfigPluginSpec } from "../plugins/factory.js";

/**
 * Shape of a user-authored plugins.json / presets.json / .ctxrunrc.json
 * file. Plugins are always declarative (same spec shape as catalog
 * entries) since arbitrary code loading from a JSON file would be a
 * code-execution footgun - anyone who needs genuinely custom logic should
 * contribute a real plugin to plugins/core/ instead.
 */
export interface ExternalConfig {
  plugins?: ConfigPluginSpec[];
  presets?: Preset[];
}

function readConfigFile(path: string): ExternalConfig | undefined {
  let raw: string;
  try {
    raw = readFileSync(path, "utf8");
  } catch {
    return undefined;
  }

  try {
    const parsed = JSON.parse(raw) as ExternalConfig;
    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse ${path} as JSON: ${(error as Error).message}`);
  }
}

/**
 * Loads user-level (~/.config/ctxrun/) and project-local (./.ctxrunrc.json)
 * plugin/preset overrides, merging in that order so project config can
 * override a user-level definition of the same name, and both can override
 * (or add to) the built-in registry. This is the seam `registry.ts`
 * previously reserved for external sources.
 */
export function loadExternalConfig(targetHome: string, cwd: string): Required<ExternalConfig> {
  const sources = [
    readConfigFile(`${targetHome}/.config/ctxrun/plugins.json`),
    readConfigFile(`${targetHome}/.config/ctxrun/presets.json`),
    readConfigFile(`${cwd}/.ctxrunrc.json`)
  ].filter((source): source is ExternalConfig => source !== undefined);

  const plugins: ConfigPluginSpec[] = [];
  const presets: Preset[] = [];

  for (const source of sources) {
    plugins.push(...(source.plugins ?? []));
    presets.push(...(source.presets ?? []));
  }

  return { plugins, presets };
}

/**
 * Merges `overrides` on top of `base`, matching by `name` (last write wins).
 * Used to let external plugin/preset definitions override or extend the
 * built-in registry.
 */
export function mergeByName<T extends { name: string }>(base: T[], overrides: T[]): T[] {
  const byName = new Map(base.map((item) => [item.name, item]));
  for (const override of overrides) {
    byName.set(override.name, override);
  }
  return [...byName.values()];
}

export function externalPluginsToCtxPlugins(specs: ConfigPluginSpec[]): CtxPlugin[] {
  return specs.map((spec) => createConfigPlugin(spec));
}
