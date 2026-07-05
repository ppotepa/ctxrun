import { CtxPlugin } from "../context/types.js";

export const codexPlugin: CtxPlugin = {
  name: "codex",
  description: "Points Codex at the target user's Codex home.",
  env(ctx) {
    return {
      env: {
        CODEX_HOME: `${ctx.targetHome}/.codex`
      }
    };
  }
};
