import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { CtxPlugin } from "../context/types.js";

export const ghPlugin: CtxPlugin = {
  name: "gh",
  description: "Points GitHub CLI at the target user's config directory.",
  env(ctx) {
    return {
      env: {
        GH_CONFIG_DIR: `${ctx.targetHome}/.config/gh`
      }
    };
  },
  async checks(ctx) {
    const hosts = `${ctx.targetHome}/.config/gh/hosts.yml`;
    try {
      await access(hosts, constants.R_OK);
      return [{ name: "gh.hosts", status: "ok", message: `${hosts} is readable` }];
    } catch {
      return [{ name: "gh.hosts", status: "warn", message: `${hosts} is missing or not readable` }];
    }
  }
};
