import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { CheckResult, CtxPlugin } from "../context/types.js";

export const awsPlugin: CtxPlugin = {
  name: "aws",
  description: "Points AWS CLI at the target user's credentials and config files.",
  env(ctx) {
    return {
      env: {
        AWS_SHARED_CREDENTIALS_FILE: `${ctx.targetHome}/.aws/credentials`,
        AWS_CONFIG_FILE: `${ctx.targetHome}/.aws/config`
      }
    };
  },
  async checks(ctx) {
    const targets: Array<[string, string]> = [
      ["aws.credentials", `${ctx.targetHome}/.aws/credentials`],
      ["aws.config", `${ctx.targetHome}/.aws/config`]
    ];

    const results: CheckResult[] = [];
    for (const [name, path] of targets) {
      try {
        await access(path, constants.R_OK);
        results.push({ name, status: "ok", message: `${path} is readable` });
      } catch {
        results.push({ name, status: "warn", message: `${path} is missing or not readable` });
      }
    }
    return results;
  }
};
