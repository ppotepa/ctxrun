import { CtxPlugin } from "../../registry/types.js";

export const basePlugin: CtxPlugin = {
  name: "base",
  description: "Preserves the target user's HOME and XDG directories.",
  env(ctx) {
    return {
      env: {
        HOME: ctx.targetHome,
        USER: ctx.targetUser,
        LOGNAME: ctx.targetUser,
        XDG_CONFIG_HOME: `${ctx.targetHome}/.config`,
        XDG_CACHE_HOME: `${ctx.targetHome}/.cache`,
        XDG_DATA_HOME: `${ctx.targetHome}/.local/share`
      }
    };
  }
};
