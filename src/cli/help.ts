// Reserved top-level words that are never treated as a preset/command shorthand.
// If a preset ever needs one of these names, it must be run explicitly via
// `ctxrun run <name>`.
export const RESERVED_COMMANDS = new Set(["run", "explain", "doctor", "plugins"]);

export function printHelp(): void {
  console.log(`ctxrun

Usage:
  ctxrun <preset|command> [...args] [--dry-run]   (shorthand for "run")
  ctxrun run <preset|command> [...args] [--dry-run]
  ctxrun explain <preset|command>
  ctxrun doctor
  ctxrun plugins list

Examples:
  ctxrun codex
  ctxrun gh auth status
  ctxrun codex-aws --dry-run
  ctxrun run codex
  ctxrun explain codex

Reserved words (always treated as commands, not presets):
  ${[...RESERVED_COMMANDS].join(", ")}
`);
}
