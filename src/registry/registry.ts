import { CtxPlugin, Preset } from "./types.js";
import { builtInPlugins } from "../plugins/index.js";
import { builtInPresets } from "../presets/index.js";

/**
 * Single source of truth for plugins and presets.
 * Today it only merges built-in sources, but it is the seam where
 * external sources (e.g. ~/.config/ctxrun/plugins/*.json, project-local
 * .ctxrunrc.json) will be merged in later without touching resolve-run.ts.
 */
export interface Registry {
  plugins: CtxPlugin[];
  presets: Preset[];
}

export function loadRegistry(): Registry {
  const plugins = [...builtInPlugins];
  const presets = resolvePresetInheritance(builtInPresets);
  return { plugins, presets };
}

export function findPlugin(registry: Registry, name: string): CtxPlugin | undefined {
  return registry.plugins.find((plugin) => plugin.name === name);
}

export function findPreset(registry: Registry, nameOrCommand: string): Preset | undefined {
  return registry.presets.find((preset) => preset.name === nameOrCommand || preset.command === nameOrCommand);
}

/**
 * Resolves `extends` chains so every preset ends up with a concrete
 * `command` and a fully merged, deduplicated `plugins` list.
 */
function resolvePresetInheritance(presets: Preset[]): Preset[] {
  const byName = new Map(presets.map((preset) => [preset.name, preset]));
  const resolved = new Map<string, Preset>();

  function resolve(preset: Preset, chain: string[] = []): Preset {
    const cached = resolved.get(preset.name);
    if (cached) {
      return cached;
    }

    if (!preset.extends) {
      if (!preset.command) {
        throw new Error(`Preset "${preset.name}" has no command and does not extend another preset.`);
      }
      resolved.set(preset.name, preset);
      return preset;
    }

    if (chain.includes(preset.name)) {
      throw new Error(`Circular preset extends detected: ${[...chain, preset.name].join(" -> ")}`);
    }

    const parent = byName.get(preset.extends);
    if (!parent) {
      throw new Error(`Preset "${preset.name}" extends unknown preset "${preset.extends}".`);
    }

    const resolvedParent = resolve(parent, [...chain, preset.name]);
    const merged: Preset = {
      ...preset,
      command: preset.command ?? resolvedParent.command,
      plugins: Array.from(new Set([...resolvedParent.plugins, ...preset.plugins]))
    };

    resolved.set(preset.name, merged);
    return merged;
  }

  return presets.map((preset) => resolve(preset));
}
