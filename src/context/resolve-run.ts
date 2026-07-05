import { ResolvedRun } from "./types.js";
import { detectUserContext } from "./user-context.js";
import { loadRegistry, findPlugin, findPreset } from "./registry.js";

export function resolveRun(commandOrPreset: string, args: string[]): ResolvedRun {
  const ctx = detectUserContext();
  const registry = loadRegistry();
  const preset = findPreset(registry, commandOrPreset);
  const command = preset?.command ?? commandOrPreset;
  const pluginNames = preset?.plugins ?? inferPlugins(command);
  const plugins = pluginNames.map((name) => {
    const plugin = findPlugin(registry, name);
    if (!plugin) {
      throw new Error(`Unknown plugin referenced by preset: ${name}`);
    }
    return plugin;
  });
  const env: Record<string, string> = {};
  const notes: string[] = [];

  for (const plugin of plugins) {
    const result = plugin.env(ctx);
    Object.assign(env, result.env);
    notes.push(...(result.notes ?? []));
  }

  return {
    command,
    args,
    env,
    plugins,
    preset,
    notes
  };
}

function inferPlugins(command: string): string[] {
  if (command === "git") {
    return ["base", "git", "ssh"];
  }

  if (command === "gh") {
    return ["base", "gh"];
  }

  return ["base"];
}

