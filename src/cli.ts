#!/usr/bin/env node
import { runCommand } from "./commands/run.js";
import { explainCommand } from "./commands/explain.js";
import { doctorCommand } from "./commands/doctor.js";
import { pluginsCommand } from "./commands/plugins.js";

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
      console.error(`Unknown command: ${command}`);
      printHelp();
      return 1;
  }
}

function printHelp(): void {
  console.log(`ctxrun

Usage:
  ctxrun run <preset|command> [...args] [--dry-run]
  ctxrun explain <preset|command>
  ctxrun doctor
  ctxrun plugins list

Examples:
  ctxrun run codex
  ctxrun run gh auth status
  ctxrun run codex-aws --dry-run
  ctxrun explain codex
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
