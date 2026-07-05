import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { CtxPlugin } from "../context/types.js";

export const claudePlugin: CtxPlugin = {
  name: "claude",
  description: "Points Claude Code CLI at the target user's Claude config directory.",
  env(ctx) {
    return {
      env: {
        CLAUDE_CONFIG_DIR: `${ctx.targetHome}/.claude`
      }
    };
  },
  async checks(ctx) {
    const home = `${ctx.targetHome}/.claude`;
    try {
      await access(home, constants.R_OK);
      return [{ name: "claude.home", status: "ok", message: `${home} is readable` }];
    } catch {
      return [{ name: "claude.home", status: "warn", message: `${home} is missing or not readable` }];
    }
  }
};
