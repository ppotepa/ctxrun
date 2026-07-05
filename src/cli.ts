#!/usr/bin/env node
import { runCommand } from "./commands/run.js";
import { explainCommand } from "./commands/explain.js";
import { doctorCommand } from "./commands/doctor.js";
import { pluginsCommand } from "./commands/plugins.js";

// Reserved top-level words that are never treated as a preset/command shorthand.
// If a preset ever needs one of these names, it must be run explicitly via
// `ctxrun run <name>`.
const RESERVED_COMMANDS = new Set(["run", "explain", "doctor", "plugins"]);

async function main(argv: string[]): Promise<number> {
  const [command, ...args] = argv;

  switch (command) {
    case "run":
      return runCommand(args);
    case "explain":
      return explainCommand(args);
    case "doctor":
      return doctorCommand(args);
    case "plugins":
      return pluginsCommand(args);
    case "-h":
    case "--help":
    case undefined:
      printHelp();
      return command === undefined ? 1 : 0;
    default:
      // Shorthand: `ctxrun <preset|command> [...args]` behaves like
      // `ctxrun run <preset|command> [...args]`, as long as the first
      // token isn't a reserved word above.
      return runCommand(argv);
  }
}

function printHelp(): void {
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

main(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
