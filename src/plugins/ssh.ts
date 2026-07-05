import { CtxPlugin } from "../context/types.js";

export const sshPlugin: CtxPlugin = {
  name: "ssh",
  description: "Preserves SSH agent socket when available.",
  env(ctx) {
    const env: Record<string, string> = {};
    const notes: string[] = [];

    if (ctx.env.SSH_AUTH_SOCK) {
      env.SSH_AUTH_SOCK = ctx.env.SSH_AUTH_SOCK;
    } else {
      notes.push("SSH_AUTH_SOCK is not set; SSH-agent based auth may not work.");
    }

    return { env, notes };
  }
};
