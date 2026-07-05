import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { CtxPlugin } from "../context/types.js";

export const pythonPlugin: CtxPlugin = {
  name: "python",
  description: "Points pip/Python user installs at the target user's config and user base.",
  env(ctx) {
    return {
      env: {
        PIP_CONFIG_FILE: `${ctx.targetHome}/.config/pip/pip.conf`,
        PYTHONUSERBASE: `${ctx.targetHome}/.local`
      }
    };
  },
  async checks(ctx) {
    const pipConf = `${ctx.targetHome}/.config/pip/pip.conf`;
    try {
      await access(pipConf, constants.R_OK);
      return [{ name: "python.pipConf", status: "ok", message: `${pipConf} is readable` }];
    } catch {
      return [{ name: "python.pipConf", status: "warn", message: `${pipConf} is missing or not readable` }];
    }
  }
};
