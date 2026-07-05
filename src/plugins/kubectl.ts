import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { CtxPlugin } from "../context/types.js";

export const kubectlPlugin: CtxPlugin = {
  name: "kubectl",
  description: "Points kubectl at the target user's kubeconfig.",
  env(ctx) {
    return {
      env: {
        KUBECONFIG: `${ctx.targetHome}/.kube/config`
      }
    };
  },
  async checks(ctx) {
    const config = `${ctx.targetHome}/.kube/config`;
    try {
      await access(config, constants.R_OK);
      return [{ name: "kubectl.config", status: "ok", message: `${config} is readable` }];
    } catch {
      return [{ name: "kubectl.config", status: "warn", message: `${config} is missing or not readable` }];
    }
  }
};
