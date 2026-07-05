import { CatalogEntry } from "./types.js";

/** Language toolchains & package managers. */
export const languagesCatalog: CatalogEntry[] = [
  {
    name: "npm",
    command: "npm",
    description: "Points npm at the target user's config and cache directories.",
    env: { npm_config_userconfig: ".npmrc", npm_config_cache: ".npm" },
    checks: [{ name: "npm.npmrc", relativePath: ".npmrc" }]
  },
  {
    name: "cargo",
    command: "cargo",
    description: "Points Cargo/rustup at the target user's toolchain and registry home.",
    env: { CARGO_HOME: ".cargo", RUSTUP_HOME: ".rustup" },
    checks: [{ name: "cargo.home", relativePath: ".cargo" }]
  },
  {
    name: "python",
    command: "python3",
    description: "Points pip/Python user installs at the target user's config and user base.",
    env: { PIP_CONFIG_FILE: ".config/pip/pip.conf", PYTHONUSERBASE: ".local" },
    checks: [{ name: "python.pipConf", relativePath: ".config/pip/pip.conf" }]
  },
  {
    name: "yarn",
    command: "yarn",
    description: "Points Yarn at the target user's config.",
    checks: [{ name: "yarn.rc", relativePath: ".yarnrc.yml" }]
  },
  {
    name: "pnpm",
    command: "pnpm",
    description: "Points pnpm at the target user's home and store.",
    env: { PNPM_HOME: ".local/share/pnpm" },
    checks: [{ name: "pnpm.rc", relativePath: ".config/pnpm/rc" }]
  },
  {
    name: "bun",
    command: "bun",
    description: "Points Bun at the target user's install directory.",
    env: { BUN_INSTALL: ".bun" }
  },
  {
    name: "go",
    command: "go",
    description: "Points Go at the target user's GOPATH, build cache, and env file.",
    env: { GOPATH: "go", GOCACHE: ".cache/go-build", GOENV: ".config/go/env" }
  },
  {
    name: "rbenv",
    command: "rbenv",
    description: "Points rbenv at the target user's Ruby version root.",
    env: { RBENV_ROOT: ".rbenv" }
  },
  {
    name: "bundler",
    command: "bundle",
    description: "Points Bundler at the target user's gem bundle home.",
    env: { BUNDLE_USER_HOME: ".bundle" }
  },
  {
    name: "composer",
    command: "composer",
    description: "Points Composer at the target user's config/cache home.",
    env: { COMPOSER_HOME: ".config/composer" }
  },
  {
    name: "maven",
    command: "mvn",
    description: "Points Maven at the target user's settings.xml.",
    checks: [{ name: "maven.settings", relativePath: ".m2/settings.xml" }]
  },
  {
    name: "gradle",
    command: "gradle",
    description: "Points Gradle at the target user's Gradle home.",
    env: { GRADLE_USER_HOME: ".gradle" }
  },
  {
    name: "sbt",
    command: "sbt",
    description: "Points sbt at the target user's config.",
    checks: [{ name: "sbt.home", relativePath: ".sbt" }]
  },
  {
    name: "cabal",
    command: "cabal",
    description: "Points Cabal at the target user's package directory.",
    env: { CABAL_DIR: ".cabal" }
  },
  {
    name: "stack",
    command: "stack",
    description: "Points Haskell Stack at the target user's stack root.",
    env: { STACK_ROOT: ".stack" }
  },
  {
    name: "dotnet",
    command: "dotnet",
    description: "Points .NET/NuGet at the target user's package cache and config.",
    env: { NUGET_PACKAGES: ".nuget/packages" },
    checks: [{ name: "nuget.config", relativePath: ".nuget/NuGet/NuGet.Config" }]
  },
  {
    name: "conda",
    command: "conda",
    description: "Points Conda at the target user's condarc.",
    checks: [{ name: "conda.rc", relativePath: ".condarc" }]
  },
  {
    name: "deno",
    command: "deno",
    description: "Points Deno at the target user's cache directory.",
    env: { DENO_DIR: ".cache/deno" }
  },
  {
    name: "lein",
    command: "lein",
    description: "Points Leiningen at the target user's profiles.",
    checks: [{ name: "lein.profiles", relativePath: ".lein/profiles.clj" }]
  },
  {
    name: "cocoapods",
    command: "pod",
    description: "Points CocoaPods at the target user's config directory.",
    checks: [{ name: "cocoapods.home", relativePath: ".cocoapods" }]
  },
  {
    name: "nvm",
    command: "nvm",
    description: "Points nvm at the target user's install directory.",
    env: { NVM_DIR: ".nvm" }
  },
  {
    name: "pyenv",
    command: "pyenv",
    description: "Points pyenv at the target user's version root.",
    env: { PYENV_ROOT: ".pyenv" }
  },
  {
    name: "sdkman",
    command: "sdk",
    description: "Points SDKMAN! at the target user's install directory.",
    env: { SDKMAN_DIR: ".sdkman" }
  },
  {
    name: "asdf",
    command: "asdf",
    description: "Points asdf at the target user's data directory.",
    env: { ASDF_DATA_DIR: ".asdf" }
  },
  {
    name: "mise",
    command: "mise",
    description: "Points mise at the target user's data directory.",
    env: { MISE_DATA_DIR: ".local/share/mise" }
  },
  {
    name: "luarocks",
    command: "luarocks",
    description: "Points LuaRocks at the target user's config directory.",
    checks: [{ name: "luarocks.home", relativePath: ".luarocks" }]
  },
  {
    name: "opam",
    command: "opam",
    description: "Points opam at the target user's root directory.",
    env: { OPAMROOT: ".opam" }
  },
  {
    name: "pipx",
    command: "pipx",
    description: "Points pipx at the target user's home directory.",
    env: { PIPX_HOME: ".local/pipx" }
  },
  {
    name: "poetry",
    command: "poetry",
    description: "Points Poetry at the target user's config.",
    checks: [{ name: "poetry.config", relativePath: ".config/pypoetry/config.toml" }]
  },
  {
    name: "pipenv",
    command: "pipenv",
    description: "Points Pipenv at the target user's cache.",
    checks: [{ name: "pipenv.cache", relativePath: ".cache/pipenv" }]
  },
  {
    name: "direnv",
    command: "direnv",
    description: "Points direnv at the target user's config.",
    checks: [{ name: "direnv.rc", relativePath: ".config/direnv/direnvrc" }]
  }
];
