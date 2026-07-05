import { resolveRun } from "../context/resolve-run.js";
import { runProcess } from "../runner/process-runner.js";
import { printResolvedRun } from "./format.js";

export async function runCommand(args: string[]): Promise<number> {
  const dryRunIndex = args.indexOf("--dry-run");
  const isDryRun = dryRunIndex !== -1;
  const filteredArgs = isDryRun ? [...args.slice(0, dryRunIndex), ...args.slice(dryRunIndex + 1)] : args;
  const [commandOrPreset, ...commandArgs] = filteredArgs;

  if (!commandOrPreset) {
    console.error("Usage: ctxrun run <preset|command> [...args] [--dry-run]");
    return 1;
  }

  const resolved = resolveRun(commandOrPreset, commandArgs);

  if (isDryRun) {
    printResolvedRun(resolved);
    return 0;
  }

  return runProcess(resolved.command, resolved.args, resolved.env);
}
