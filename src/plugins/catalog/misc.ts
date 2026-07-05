import { CatalogEntry } from "./types.js";

/** Miscellaneous everyday CLI tools. */
export const miscCatalog: CatalogEntry[] = [
  {
    name: "curl",
    command: "curl",
    description: "Runs curl with the target user's curlrc.",
    checks: [{ name: "curl.rc", relativePath: ".curlrc" }]
  },
  {
    name: "wget",
    command: "wget",
    description: "Runs wget with the target user's wgetrc.",
    checks: [{ name: "wget.rc", relativePath: ".wgetrc" }]
  },
  {
    name: "httpie",
    command: "http",
    description: "Points HTTPie at the target user's config directory.",
    env: { HTTPIE_CONFIG_DIR: ".config/httpie" }
  },
  {
    name: "keychain",
    command: "keychain",
    description: "Runs keychain with the target user's keychain state directory.",
    checks: [{ name: "keychain.home", relativePath: ".keychain" }]
  }
];
