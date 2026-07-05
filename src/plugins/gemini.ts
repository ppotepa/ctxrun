import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { CtxPlugin } from "../context/types.js";

export const geminiPlugin: CtxPlugin = {
  name: "gemini",
  description: "Points Gemini CLI at the target user's Gemini home.",
  env(ctx) {
    return {
      env: {
        GEMINI_HOME: `${ctx.targetHome}/.gemini`
      }
    };
  },
  async checks(ctx) {
    const home = `${ctx.targetHome}/.gemini`;
    try {
      await access(home, constants.R_OK);
      return [{ name: "gemini.home", status: "ok", message: `${home} is readable` }];
    } catch {
      return [{ name: "gemini.home", status: "warn", message: `${home} is missing or not readable` }];
    }
  }
};
