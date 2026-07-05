import { resolveRun } from "../../registry/resolve-run.js";
import { printResolvedRun } from "./format.js";
import { extractValueFlag } from "./args.js";

export async function explainCommand(args: string[]): Promise<number> {
  const { value: profileName, rest: filteredArgs } = extractValueFlag(args, "--profile");
  const [commandOrPreset, ...commandArgs] = filteredArgs;

  if (!commandOrPreset) {
    console.error("Usage: ctxrun explain <preset|command> [--profile <name>]");
    return 1;
  }

  const resolved = resolveRun(commandOrPreset, commandArgs, profileName);
  printResolvedRun(resolved);

  return 0;
}
