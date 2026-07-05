import { loadRegistry } from "../../registry/registry.js";
import { detectUserContext } from "../../user-context/detect.js";
import { extractValueFlag } from "./args.js";

export async function pluginsCommand(args: string[]): Promise<number> {
  const { value: profileName, rest: afterProfile } = extractValueFlag(args, "--profile");
  const [subcommand, ...rest] = afterProfile;
  const asJson = rest.includes("--json");

  if (subcommand !== "list") {
    console.error("Usage: ctxrun plugins list [--json] [--profile <name>]");
    return 1;
  }

  const ctx = detectUserContext(process.env, profileName);
  const registry = loadRegistry({ targetHome: ctx.targetHome });

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
