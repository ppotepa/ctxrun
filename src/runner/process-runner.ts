import { spawn } from "node:child_process";

/**
 * Environment variables that are safe to pass through from ctxrun's own
 * process regardless of which plugins are active - terminal/locale/PATH
 * plumbing that almost every CLI tool needs to behave correctly, but that
 * carries no user-specific config state. Everything else must come from a
 * plugin's env patch. This is the allowlist referenced in the README's
 * Milestone 2 roadmap: previously the runner merged the *entire*
 * process.env, which meant sudo's ambient environment (including anything
 * an attacker-controlled parent process set) reached the child unfiltered.
 */
const ENV_ALLOWLIST = [
  "PATH",
  "TERM",
  "TERMINFO",
  "COLORTERM",
  "LANG",
  "LANGUAGE",
  "LC_ALL",
  "LC_CTYPE",
  "SHELL",
  "TZ",
  "TMPDIR",
  "PWD"
];

const ENV_ALLOWLIST_PREFIXES = ["LC_"];

function buildEnv(envPatch: Record<string, string>): Record<string, string> {
  const env: Record<string, string> = {};

  for (const [key, value] of Object.entries(process.env)) {
    if (value === undefined) {
      continue;
    }
    if (ENV_ALLOWLIST.includes(key) || ENV_ALLOWLIST_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      env[key] = value;
    }
  }

  // Plugin-provided values always win over the ambient allowlisted ones.
  return { ...env, ...envPatch };
}

const FORWARDED_SIGNALS = ["SIGINT", "SIGTERM", "SIGHUP", "SIGQUIT"] as const;

export function runProcess(command: string, args: string[], envPatch: Record<string, string>): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: buildEnv(envPatch)
    });

    const forwardSignal = (signal: NodeJS.Signals) => {
      child.kill(signal);
    };

    for (const signal of FORWARDED_SIGNALS) {
      process.on(signal, forwardSignal);
    }

    const cleanup = () => {
      for (const signal of FORWARDED_SIGNALS) {
        process.off(signal, forwardSignal);
      }
    };

    child.on("error", (error: NodeJS.ErrnoException) => {
      cleanup();
      if (error.code === "ENOENT") {
        reject(new Error(`Command not found: ${command}`));
        return;
      }
      reject(error);
    });

    child.on("close", (code, signal) => {
      cleanup();
      if (signal) {
        // Re-raise the same signal against ourselves so the parent shell
        // sees the conventional 128+n exit status instead of a plain 1.
        process.kill(process.pid, signal);
        return;
      }
      resolve(code ?? 1);
    });
  });
}
