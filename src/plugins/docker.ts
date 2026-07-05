import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { CtxPlugin } from "../context/types.js";

export const dockerPlugin: CtxPlugin = {
  name: "docker",
  description: "Points Docker CLI at the target user's config and credential store.",
  env(ctx) {
    return {
      env: {
        DOCKER_CONFIG: `${ctx.targetHome}/.docker`
      }
    };
  },
  async checks(ctx) {
    const config = `${ctx.targetHome}/.docker/config.json`;
    try {
      await access(config, constants.R_OK);
      return [{ name: "docker.config", status: "ok", message: `${config} is readable` }];
    } catch {
      return [{ name: "docker.config", status: "warn", message: `${config} is missing or not readable` }];
    }
  }
};
