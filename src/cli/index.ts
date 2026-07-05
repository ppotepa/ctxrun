#!/usr/bin/env node
import { runCommand } from "./commands/run.js";
import { explainCommand } from "./commands/explain.js";
import { doctorCommand } from "./commands/doctor.js";
import { pluginsCommand } from "./commands/plugins.js";
import { printHelp } from "./help.js";
import { extractValueFlag } from "./commands/args.js";

async function main(argv: string[]): Promise<number> {
  // Allow flags like --profile to appear before the subcommand name:
  //   ctxrun --profile X doctor  →  same as  ctxrun doctor --profile X
  // Strip known pre-command flags before dispatch, then reattach to the args
  // passed to each handler (which re-extract them via extractValueFlag).
  const { value: profile, rest: stripped } = extractValueFlag(argv, "--profile");
  const profileSuffix: string[] = profile !== undefined ? ["--profile", profile] : [];

  const [command, ...args] = stripped;

  switch (command) {
    case "run":
      return runCommand([...args, ...profileSuffix]);
    case "explain":
      return explainCommand([...args, ...profileSuffix]);
    case "doctor":
      return doctorCommand([...args, ...profileSuffix]);
    case "plugins":
      return pluginsCommand([...args, ...profileSuffix]);
    case "-h":
    case "--help":
    case undefined:
      printHelp();
      return command === undefined ? 1 : 0;
    default:
      // Shorthand: `ctxrun <preset|command> [...args]` behaves like
      // `ctxrun run <preset|command> [...args]`, as long as the first
      // token isn't a reserved word above.
      return runCommand([...stripped, ...profileSuffix]);
  }
}

main(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
