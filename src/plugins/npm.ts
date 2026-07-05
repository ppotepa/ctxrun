import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { CtxPlugin } from "../context/types.js";

export const npmPlugin: CtxPlugin = {
  name: "npm",
  description: "Points npm at the target user's config and cache directories.",
  env(ctx) {
    return {
      env: {
        npm_config_userconfig: `${ctx.targetHome}/.npmrc`,
        npm_config_cache: `${ctx.targetHome}/.npm`
      }
    };
  },
  async checks(ctx) {
    const npmrc = `${ctx.targetHome}/.npmrc`;
    try {
      await access(npmrc, constants.R_OK);
      return [{ name: "npm.npmrc", status: "ok", message: `${npmrc} is readable` }];
    } catch {
      return [{ name: "npm.npmrc", status: "warn", message: `${npmrc} is missing or not readable` }];
    }
  }
};
