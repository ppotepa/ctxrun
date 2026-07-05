#!/usr/bin/env node
import { runCommand } from "./commands/run.js";
import { explainCommand } from "./commands/explain.js";
import { doctorCommand } from "./commands/doctor.js";
import { pluginsCommand } from "./commands/plugins.js";
import { printHelp } from "./help.js";

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

main(process.argv.slice(2))
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
