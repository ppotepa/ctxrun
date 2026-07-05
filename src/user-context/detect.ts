import os from "node:os";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { UserContext } from "./types.js";

export interface ProfileOverride {
  targetUser?: string;
  targetHome?: string;
}

/**
 * Detects the "real" user behind a possible `sudo` invocation and resolves
 * their home directory. This is the only place that inspects `SUDO_USER` /
 * `getuid()` / `getent passwd` - everything downstream (plugins, registry,
 * runner) works off the resulting UserContext instead of process.env.
 *
 * `profileName`, when given, looks up an override in
 * `<resolved-home>/.config/ctxrun/profiles.json` and applies it on top of
 * the sudo-derived defaults - for cases where sudo detection alone isn't
 * enough (e.g. running as a service account, or intentionally targeting a
 * different user's config than the one that invoked ctxrun).
 */
export function detectUserContext(env: NodeJS.ProcessEnv = process.env, profileName?: string): UserContext {
  const currentUid = typeof process.getuid === "function" ? process.getuid() : -1;
  const currentUser = os.userInfo().username;
  const sudoUser = env.SUDO_USER && env.SUDO_USER !== "root" ? env.SUDO_USER : undefined;
  let targetUser = sudoUser ?? currentUser;
  let targetHome = resolveHome(targetUser, env);

  if (profileName) {
    const profile = loadProfile(targetHome, profileName);
    if (!profile) {
      throw new Error(
        `Unknown ctxrun profile "${profileName}" (looked in ${targetHome}/.config/ctxrun/profiles.json)`
      );
    }

    if (profile.targetUser && profile.targetUser !== targetUser) {
      targetUser = profile.targetUser;
      targetHome = profile.targetHome ?? resolveHome(targetUser, env);
    } else if (profile.targetHome) {
      targetHome = profile.targetHome;
    }
  }

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

function loadProfile(baseHome: string, name: string): ProfileOverride | undefined {
  try {
    const raw = readFileSync(`${baseHome}/.config/ctxrun/profiles.json`, "utf8");
    const profiles = JSON.parse(raw) as Record<string, ProfileOverride>;
    return profiles[name];
  } catch {
    return undefined;
  }
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
