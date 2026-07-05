import { ResolvedRun } from "../../registry/types.js";

export function printResolvedRun(resolved: ResolvedRun): void {
  console.log(`Command: ${resolved.command}`);
  console.log(`Args: ${resolved.args.join(" ") || "(none)"}`);
  console.log(`Preset: ${resolved.preset?.name ?? "(inferred)"}`);
  console.log(`Plugins: ${resolved.plugins.map((plugin) => plugin.name).join(", ")}`);
  console.log("Environment:");

  for (const [key, value] of Object.entries(resolved.env).sort(([left], [right]) => left.localeCompare(right))) {
    console.log(`  ${key}=${value}`);
  }

  if (resolved.notes.length > 0) {
    console.log("Notes:");
    for (const note of resolved.notes) {
      console.log(`  - ${note}`);
    }
  }
}
