import { CatalogEntry } from "./types.js";

/** Secrets managers & encryption tooling. */
export const secretsCatalog: CatalogEntry[] = [
  {
    name: "gpg",
    command: "gpg",
    description: "Points GnuPG at the target user's home directory.",
    env: { GNUPGHOME: ".gnupg" }
  },
  {
    name: "pass",
    command: "pass",
    description: "Points pass (password-store) at the target user's store directory.",
    env: { PASSWORD_STORE_DIR: ".password-store" }
  },
  {
    name: "op",
    command: "op",
    description: "Points the 1Password CLI at the target user's config.",
    checks: [{ name: "op.config", relativePath: ".config/op/config" }]
  },
  {
    name: "bitwarden",
    command: "bw",
    description: "Points the Bitwarden CLI at the target user's app data directory.",
    env: { BITWARDENCLI_APPDATA_DIR: ".config/Bitwarden CLI" }
  },
  {
    name: "sops",
    command: "sops",
    description: "Points sops at the target user's age key file.",
    env: { SOPS_AGE_KEY_FILE: ".config/sops/age/keys.txt" }
  }
];
