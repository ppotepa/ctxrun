import { resolveRun } from "../../registry/resolve-run.js";
import { runProcess } from "../../runner/process-runner.js";
import { printResolvedRun } from "./format.js";
import { extractValueFlag, extractBooleanFlag } from "./args.js";

export async function runCommand(args: string[]): Promise<number> {
  const { value: profileName, rest: afterProfile } = extractValueFlag(args, "--profile");
  const { present: isDryRun, rest: filteredArgs } = extractBooleanFlag(afterProfile, "--dry-run");
  const [commandOrPreset, ...commandArgs] = filteredArgs;

  if (!commandOrPreset) {
    console.error("Usage: ctxrun run <preset|command> [...args] [--profile <name>] [--dry-run]");
    return 1;
  }

  const resolved = resolveRun(commandOrPreset, commandArgs, profileName);

  if (isDryRun) {
    printResolvedRun(resolved);
    return 0;
  }

  return runProcess(resolved.command, resolved.args, resolved.env);
}
