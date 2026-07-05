import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { CheckResult, CtxPlugin } from "../registry/types.js";

export interface ConfigCheckSpec {
  /** Check name reported by `ctxrun doctor`, e.g. "terraform.rc". */
  name: string;
  /** Path relative to the target user's home directory. */
  relativePath: string;
}

export interface ConfigPluginSpec {
  name: string;
  description: string;
  /** Environment variables to set, keyed by name, valued as a path relative to targetHome. */
  env?: Record<string, string>;
  /** Files/directories to check for readability, reported via `ctxrun doctor`. */
  checks?: ConfigCheckSpec[];
}

/**
 * Builds a CtxPlugin from a declarative spec instead of hand-writing a full
 * plugin module. Used for tools that only need to point one or more env
 * vars at a path under the target user's home, plus optional readability
 * checks. Tools with more involved logic (conditional env, reading process
 * env, composing multiple sources) stay hand-written - see plugins/core/.
 */
export function createConfigPlugin(spec: ConfigPluginSpec): CtxPlugin {
  return {
    name: spec.name,
    description: spec.description,
    env(ctx) {
      const env: Record<string, string> = {};
      for (const [key, relativePath] of Object.entries(spec.env ?? {})) {
        env[key] = `${ctx.targetHome}/${relativePath}`;
      }
      return { env };
    },
    async checks(ctx) {
      if (!spec.checks || spec.checks.length === 0) {
        return [];
      }

      const results: CheckResult[] = [];
      for (const check of spec.checks) {
        const path = `${ctx.targetHome}/${check.relativePath}`;
        try {
          await access(path, constants.R_OK);
          results.push({ name: check.name, status: "ok", message: `${path} is readable` });
        } catch {
          results.push({ name: check.name, status: "warn", message: `${path} is missing or not readable` });
        }
      }
      return results;
    }
  };
}
