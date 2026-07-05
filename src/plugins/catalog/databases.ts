import { CatalogEntry } from "./types.js";

/** Database client CLIs. */
export const databasesCatalog: CatalogEntry[] = [
  {
    name: "psql",
    command: "psql",
    description: "Points psql at the target user's password and service files.",
    env: { PGPASSFILE: ".pgpass", PGSERVICEFILE: ".pg_service.conf" }
  },
  {
    name: "mysql",
    command: "mysql",
    description: "Points the MySQL CLI at the target user's my.cnf.",
    checks: [{ name: "mysql.cnf", relativePath: ".my.cnf" }]
  },
  {
    name: "mongosh",
    command: "mongosh",
    description: "Points mongosh at the target user's config.",
    checks: [{ name: "mongosh.rc", relativePath: ".mongoshrc.js" }]
  },
  {
    name: "redis-cli",
    command: "redis-cli",
    description: "Points redis-cli at the target user's config.",
    checks: [{ name: "rediscli.rc", relativePath: ".redisclirc" }]
  },
  {
    name: "sqlite",
    command: "sqlite3",
    description: "Points sqlite3 at the target user's sqliterc.",
    checks: [{ name: "sqlite.rc", relativePath: ".sqliterc" }]
  },
  {
    name: "cockroach",
    command: "cockroach",
    description: "Points the CockroachDB CLI at the target user's certs directory.",
    checks: [{ name: "cockroach.certs", relativePath: ".cockroach-certs" }]
  }
];
