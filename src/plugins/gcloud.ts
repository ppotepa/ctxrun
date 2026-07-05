import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { CtxPlugin } from "../context/types.js";

export const gcloudPlugin: CtxPlugin = {
  name: "gcloud",
  description: "Points Google Cloud CLI at the target user's config directory.",
  env(ctx) {
    return {
      env: {
        CLOUDSDK_CONFIG: `${ctx.targetHome}/.config/gcloud`
      }
    };
  },
  async checks(ctx) {
    const activeConfig = `${ctx.targetHome}/.config/gcloud/active_config`;
    try {
      await access(activeConfig, constants.R_OK);
      return [{ name: "gcloud.activeConfig", status: "ok", message: `${activeConfig} is readable` }];
    } catch {
      return [{ name: "gcloud.activeConfig", status: "warn", message: `${activeConfig} is missing or not readable` }];
    }
  }
};
