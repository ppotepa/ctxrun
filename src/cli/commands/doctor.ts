import { detectUserContext } from "../../user-context/detect.js";
import { loadRegistry } from "../../registry/registry.js";

export async function doctorCommand(_args: string[] = []): Promise<number> {
  const ctx = detectUserContext();
  const registry = loadRegistry();
  let failed = false;

  console.log("Context:");
  console.log(`  currentUser=${ctx.currentUser}`);
  console.log(`  currentUid=${ctx.currentUid}`);
  console.log(`  targetUser=${ctx.targetUser}`);
  console.log(`  targetHome=${ctx.targetHome}`);
  console.log(`  sudoUser=${ctx.sudoUser ?? "(none)"}`);
  console.log("");
  console.log("Checks:");

  for (const plugin of registry.plugins) {
    const checks = await plugin.checks?.(ctx);
    for (const check of checks ?? []) {
      if (check.status === "fail") {
        failed = true;
      }
      console.log(`  [${check.status}] ${check.name}: ${check.message}`);
    }
  }

  return failed ? 1 : 0;
}
