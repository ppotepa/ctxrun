import { resolveRun } from "../context/resolve-run.js";
import { printResolvedRun } from "./format.js";

export async function explainCommand(args: string[]): Promise<number> {
  const [commandOrPreset, ...commandArgs] = args;

  if (!commandOrPreset) {
    console.error("Usage: ctxrun explain <preset|command>");
    return 1;
  }

  const resolved = resolveRun(commandOrPreset, commandArgs);
  printResolvedRun(resolved);

  return 0;
}

