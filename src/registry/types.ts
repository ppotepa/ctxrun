import { UserContext } from "../user-context/types.js";

export interface PluginEnvResult {
  env: Record<string, string>;
  notes?: string[];
}

export interface CheckResult {
  name: string;
  status: "ok" | "warn" | "fail";
  message: string;
}

export interface CtxPlugin {
  name: string;
  description: string;
  env(ctx: UserContext): PluginEnvResult;
  checks?(ctx: UserContext): Promise<CheckResult[]>;
}

export interface Preset {
  name: string;
  command?: string;
  plugins: string[];
  extends?: string;
  description: string;
}

export interface ResolvedRun {
  command: string;
  args: string[];
  env: Record<string, string>;
  plugins: CtxPlugin[];
  preset?: Preset;
  notes: string[];
}
