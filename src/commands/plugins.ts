import { loadRegistry } from "../context/registry.js";

export async function pluginsCommand(args: string[]): Promise<number> {
  const [subcommand] = args;

  if (subcommand !== "list") {
    console.error("Usage: ctxrun plugins list");
    return 1;
  }

  const registry = loadRegistry();

  console.log("Plugins:");
  for (const plugin of registry.plugins) {
    console.log(`  ${plugin.name} - ${plugin.description}`);
  }

  console.log("");
  console.log("Presets:");
  for (const preset of registry.presets) {
    const via = preset.extends ? ` (extends ${preset.extends})` : "";
    console.log(`  ${preset.name} -> ${preset.command}${via} [${preset.plugins.join(", ")}]`);
  }

  return 0;
}
