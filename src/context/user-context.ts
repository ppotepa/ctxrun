import os from "node:os";
import { execFileSync } from "node:child_process";
import { UserContext } from "./types.js";

export function detectUserContext(env: NodeJS.ProcessEnv = process.env): UserContext {
  const currentUid = typeof process.getuid === "function" ? process.getuid() : -1;
  const currentUser = os.userInfo().username;
  const sudoUser = env.SUDO_USER && env.SUDO_USER !== "root" ? env.SUDO_USER : undefined;
  const targetUser = sudoUser ?? currentUser;
  const targetHome = resolveHome(targetUser, env);

  return {
    currentUid,
    currentUser,
    targetUser,
    targetHome,
    isRoot: currentUid === 0,
    sudoUser,
    env
  };
}

function resolveHome(user: string, env: NodeJS.ProcessEnv): string {
  if (env.SUDO_USER === user && env.SUDO_HOME) {
    return env.SUDO_HOME;
  }

  if (user === os.userInfo().username && env.HOME) {
    return env.HOME;
  }

  try {
    return execFileSync("getent", ["passwd", user], { encoding: "utf8" })
      .trim()
      .split(":")[5];
  } catch {
    return `/home/${user}`;
  }
}
