import { spawn } from "node:child_process";

export function runProcess(command: string, args: string[], envPatch: Record<string, string>): Promise<number> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: "inherit",
      env: {
        ...process.env,
        ...envPatch
      }
    });

    child.on("error", reject);
    child.on("close", (code) => resolve(code ?? 1));
  });
}
