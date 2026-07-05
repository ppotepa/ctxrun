import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { CtxPlugin } from "../../registry/types.js";

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
  },
  async checks(ctx) {
    const sock = ctx.env.SSH_AUTH_SOCK;

    if (!sock) {
      return [
        {
          name: "ssh.agent",
          status: "warn",
          message: "SSH_AUTH_SOCK is not set; no SSH agent to forward."
        }
      ];
    }

    try {
      await access(sock, constants.R_OK);
      return [{ name: "ssh.agent", status: "ok", message: `${sock} is reachable` }];
    } catch {
      return [
        {
          name: "ssh.agent",
          status: "warn",
          message: `SSH_AUTH_SOCK is set to ${sock} but it is not reachable`
        }
      ];
    }
  }
};
