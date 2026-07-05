import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { CtxPlugin } from "../context/types.js";

export const gitPlugin: CtxPlugin = {
  name: "git",
  description: "Points Git at the target user's global config.",
  env(ctx) {
    return {
      env: {
        GIT_CONFIG_GLOBAL: `${ctx.targetHome}/.gitconfig`
      }
    };
  },
  async checks(ctx) {
    const config = `${ctx.targetHome}/.gitconfig`;
    try {
      await access(config, constants.R_OK);
      return [{ name: "git.config", status: "ok", message: `${config} is readable` }];
    } catch {
      return [{ name: "git.config", status: "warn", message: `${config} is missing or not readable` }];
    }
  }
};
