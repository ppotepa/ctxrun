/**
 * Extracts a `--flag <value>` pair from an argv-style array, returning the
 * value (if present) and the remaining args with both tokens removed. Used
 * so command handlers can support flags like `--profile <name>` without
 * each one re-implementing argv scanning.
 */
export function extractValueFlag(args: string[], flag: string): { value?: string; rest: string[] } {
  const index = args.indexOf(flag);
  if (index === -1) {
    return { rest: args };
  }

  const value = args[index + 1];
  const rest = [...args.slice(0, index), ...args.slice(index + 2)];
  return { value, rest };
}

/**
 * Extracts a boolean `--flag` from an argv-style array, returning whether it
 * was present and the remaining args with it removed.
 */
export function extractBooleanFlag(args: string[], flag: string): { present: boolean; rest: string[] } {
  const index = args.indexOf(flag);
  if (index === -1) {
    return { present: false, rest: args };
  }

  const rest = [...args.slice(0, index), ...args.slice(index + 1)];
  return { present: true, rest };
}
