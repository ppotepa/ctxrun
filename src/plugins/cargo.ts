import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { CtxPlugin } from "../context/types.js";

export const cargoPlugin: CtxPlugin = {
  name: "cargo",
  description: "Points Cargo/rustup at the target user's toolchain and registry home.",
  env(ctx) {
    return {
      env: {
        CARGO_HOME: `${ctx.targetHome}/.cargo`,
        RUSTUP_HOME: `${ctx.targetHome}/.rustup`
      }
    };
  },
  async checks(ctx) {
    const cargoHome = `${ctx.targetHome}/.cargo`;
    try {
      await access(cargoHome, constants.R_OK);
      return [{ name: "cargo.home", status: "ok", message: `${cargoHome} is readable` }];
    } catch {
      return [{ name: "cargo.home", status: "warn", message: `${cargoHome} is missing or not readable` }];
    }
  }
};
