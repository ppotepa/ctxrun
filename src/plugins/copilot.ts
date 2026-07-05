import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { CtxPlugin } from "../context/types.js";

export const copilotPlugin: CtxPlugin = {
  name: "copilot",
  description: "Points GitHub Copilot CLI at the target user's Copilot home.",
  env(ctx) {
    return {
      env: {
        COPILOT_HOME: `${ctx.targetHome}/.copilot`
      }
    };
  },
  async checks(ctx) {
    const home = `${ctx.targetHome}/.copilot`;
    try {
      await access(home, constants.R_OK);
      return [{ name: "copilot.home", status: "ok", message: `${home} is readable` }];
    } catch {
      return [{ name: "copilot.home", status: "warn", message: `${home} is missing or not readable` }];
    }
  }
};
