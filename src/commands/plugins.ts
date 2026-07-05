import { loadRegistry } from "../context/registry.js";

export async function pluginsCommand(args: string[]): Promise<number> {
  const [subcommand, ...rest] = args;
  const asJson = rest.includes("--json");

  if (subcommand !== "list") {
    console.error("Usage: ctxrun plugins list [--json]");
    return 1;
  }

  const registry = loadRegistry();

  if (asJson) {
    console.log(
      JSON.stringify(
        {
          plugins: registry.plugins.map((plugin) => ({ name: plugin.name, description: plugin.description })),
          presets: registry.presets.map((preset) => ({
            name: preset.name,
            command: preset.command,
            plugins: preset.plugins,
            extends: preset.extends
          }))
        },
        null,
        2
      )
    );
    return 0;
  }

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
