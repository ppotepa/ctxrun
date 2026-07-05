import { ConfigPluginSpec } from "./factory.js";

export interface CatalogEntry extends ConfigPluginSpec {
  /** Binary invoked when this preset is run, e.g. "terraform". */
  command: string;
}

/**
 * Data-driven catalog of everyday developer CLI tools. Each entry becomes
 * both a plugin (via createConfigPlugin) and a matching 1:1 preset
 * (`base` + the tool's own plugin). This keeps the long tail of tool
 * integrations declarative instead of ~100 near-identical hand-written
 * files.
 *
 * Entries with no `env` only contribute `doctor` checks: the tool already
 * honors `HOME`/XDG_* from the `base` plugin, so there is nothing to patch,
 * but surfacing config presence is still useful diagnostically.
 */
export const catalog: CatalogEntry[] = [
  // --- Language toolchains & package managers ---
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
  },

  // --- Cloud & infra CLIs ---
  {
    name: "azure",
    command: "az",
    description: "Points Azure CLI at the target user's config directory.",
    env: { AZURE_CONFIG_DIR: ".azure" }
  },
  {
    name: "doctl",
    command: "doctl",
    description: "Points doctl (DigitalOcean) at the target user's config.",
    checks: [{ name: "doctl.config", relativePath: ".config/doctl/config.yaml" }]
  },
  {
    name: "heroku",
    command: "heroku",
    description: "Points Heroku CLI at the target user's netrc credentials.",
    checks: [{ name: "heroku.netrc", relativePath: ".netrc" }]
  },
  {
    name: "vercel",
    command: "vercel",
    description: "Points Vercel CLI at the target user's config directory.",
    checks: [{ name: "vercel.config", relativePath: ".local/share/com.vercel.cli" }]
  },
  {
    name: "netlify",
    command: "netlify",
    description: "Points Netlify CLI at the target user's config directory.",
    checks: [{ name: "netlify.config", relativePath: ".config/netlify" }]
  },
  {
    name: "flyctl",
    command: "flyctl",
    description: "Points flyctl (Fly.io) at the target user's config.",
    checks: [{ name: "flyctl.config", relativePath: ".fly/config.yml" }]
  },
  {
    name: "railway",
    command: "railway",
    description: "Points the Railway CLI at the target user's config.",
    checks: [{ name: "railway.config", relativePath: ".railway/config.json" }]
  },
  {
    name: "wrangler",
    command: "wrangler",
    description: "Points Wrangler (Cloudflare) at the target user's config.",
    checks: [{ name: "wrangler.config", relativePath: ".wrangler" }]
  },
  {
    name: "terraform",
    command: "terraform",
    description: "Points Terraform at the target user's CLI config and credentials.",
    checks: [
      { name: "terraform.rc", relativePath: ".terraformrc" },
      { name: "terraform.credentials", relativePath: ".terraform.d/credentials.tfrc.json" }
    ]
  },
  {
    name: "terragrunt",
    command: "terragrunt",
    description: "Runs Terragrunt with the target user's Terraform config and credentials.",
    checks: [{ name: "terraform.rc", relativePath: ".terraformrc" }]
  },
  {
    name: "pulumi",
    command: "pulumi",
    description: "Points Pulumi at the target user's home directory.",
    env: { PULUMI_HOME: ".pulumi" }
  },
  {
    name: "ansible",
    command: "ansible",
    description: "Points Ansible at the target user's home directory.",
    env: { ANSIBLE_HOME: ".ansible" }
  },
  {
    name: "packer",
    command: "packer",
    description: "Points Packer at the target user's config file.",
    checks: [{ name: "packer.config", relativePath: ".packerconfig" }]
  },
  {
    name: "vagrant",
    command: "vagrant",
    description: "Points Vagrant at the target user's data directory.",
    env: { VAGRANT_HOME: ".vagrant.d" }
  },
  {
    name: "helm",
    command: "helm",
    description: "Points Helm at the target user's config/cache/data directories.",
    env: {
      HELM_CONFIG_HOME: ".config/helm",
      HELM_CACHE_HOME: ".cache/helm",
      HELM_DATA_HOME: ".local/share/helm"
    }
  },
  {
    name: "k9s",
    command: "k9s",
    description: "Points k9s at the target user's config directory.",
    checks: [{ name: "k9s.config", relativePath: ".config/k9s" }]
  },
  {
    name: "minikube",
    command: "minikube",
    description: "Points minikube at the target user's home directory.",
    env: { MINIKUBE_HOME: ".minikube" }
  },
  {
    name: "kind",
    command: "kind",
    description: "Runs kind with the target user's kubeconfig (see the kubectl preset).",
    checks: [{ name: "kube.config", relativePath: ".kube/config" }]
  },
  {
    name: "eksctl",
    command: "eksctl",
    description: "Points eksctl at the target user's config directory.",
    checks: [{ name: "eksctl.home", relativePath: ".eksctl" }]
  },
  {
    name: "argocd",
    command: "argocd",
    description: "Points the Argo CD CLI at the target user's config directory.",
    checks: [{ name: "argocd.config", relativePath: ".config/argocd" }]
  },
  {
    name: "flux",
    command: "flux",
    description: "Runs the Flux CLI with the target user's kubeconfig.",
    checks: [{ name: "kube.config", relativePath: ".kube/config" }]
  },
  {
    name: "istioctl",
    command: "istioctl",
    description: "Points istioctl at the target user's config directory.",
    checks: [{ name: "istioctl.home", relativePath: ".istioctl" }]
  },
  {
    name: "consul",
    command: "consul",
    description: "Points the Consul CLI at the target user's config directory.",
    checks: [{ name: "consul.home", relativePath: ".consul.d" }]
  },
  {
    name: "vault",
    command: "vault",
    description: "Points the Vault CLI at the target user's token file.",
    checks: [{ name: "vault.token", relativePath: ".vault-token" }]
  },
  {
    name: "nomad",
    command: "nomad",
    description: "Points the Nomad CLI at the target user's config directory.",
    checks: [{ name: "nomad.home", relativePath: ".nomad.d" }]
  },
  {
    name: "sops",
    command: "sops",
    description: "Points sops at the target user's age key file.",
    env: { SOPS_AGE_KEY_FILE: ".config/sops/age/keys.txt" }
  },

  // --- Containers ---
  {
    name: "docker-compose",
    command: "docker-compose",
    description: "Runs Docker Compose with the target user's Docker config (see the docker preset).",
    env: { DOCKER_CONFIG: ".docker" }
  },
  {
    name: "podman",
    command: "podman",
    description: "Points Podman at the target user's registry auth file.",
    env: { REGISTRY_AUTH_FILE: ".config/containers/auth.json" }
  },
  {
    name: "buildah",
    command: "buildah",
    description: "Points Buildah at the target user's registry auth file.",
    env: { REGISTRY_AUTH_FILE: ".config/containers/auth.json" }
  },
  {
    name: "skopeo",
    command: "skopeo",
    description: "Points Skopeo at the target user's registry auth file.",
    env: { REGISTRY_AUTH_FILE: ".config/containers/auth.json" }
  },
  {
    name: "nerdctl",
    command: "nerdctl",
    description: "Points nerdctl at the target user's config directory.",
    checks: [{ name: "nerdctl.config", relativePath: ".config/nerdctl" }]
  },
  {
    name: "colima",
    command: "colima",
    description: "Points Colima at the target user's config directory.",
    checks: [{ name: "colima.home", relativePath: ".colima" }]
  },
  {
    name: "lima",
    command: "limactl",
    description: "Points Lima at the target user's config directory.",
    checks: [{ name: "lima.home", relativePath: ".lima" }]
  },

  // --- VCS & collaboration ---
  {
    name: "glab",
    command: "glab",
    description: "Points the GitLab CLI at the target user's config.",
    checks: [{ name: "glab.config", relativePath: ".config/glab-cli/config.yml" }]
  },
  {
    name: "hub",
    command: "hub",
    description: "Points hub at the target user's config directory.",
    checks: [{ name: "hub.config", relativePath: ".config/hub" }]
  },
  {
    name: "git-lfs",
    command: "git-lfs",
    description: "Runs Git LFS with the target user's Git config (see the git preset).",
    checks: [{ name: "git.config", relativePath: ".gitconfig" }]
  },
  {
    name: "svn",
    command: "svn",
    description: "Points Subversion at the target user's config directory.",
    checks: [{ name: "svn.home", relativePath: ".subversion" }]
  },
  {
    name: "hg",
    command: "hg",
    description: "Points Mercurial at the target user's hgrc.",
    checks: [{ name: "hg.rc", relativePath: ".hgrc" }]
  },

  // --- Editors & terminal ---
  {
    name: "vim",
    command: "vim",
    description: "Points Vim at the target user's vimrc.",
    checks: [{ name: "vim.rc", relativePath: ".vimrc" }]
  },
  {
    name: "neovim",
    command: "nvim",
    description: "Points Neovim at the target user's config.",
    checks: [{ name: "nvim.config", relativePath: ".config/nvim/init.vim" }]
  },
  {
    name: "tmux",
    command: "tmux",
    description: "Points tmux at the target user's config.",
    checks: [{ name: "tmux.conf", relativePath: ".tmux.conf" }]
  },
  {
    name: "starship",
    command: "starship",
    description: "Points the Starship prompt at the target user's config.",
    env: { STARSHIP_CONFIG: ".config/starship.toml" }
  },
  {
    name: "zoxide",
    command: "zoxide",
    description: "Points zoxide at the target user's data directory.",
    env: { _ZO_DATA_DIR: ".local/share/zoxide" }
  },
  {
    name: "fzf",
    command: "fzf",
    description: "Runs fzf with the target user's shell integration files.",
    checks: [{ name: "fzf.bash", relativePath: ".fzf.bash" }]
  },
  {
    name: "lazygit",
    command: "lazygit",
    description: "Points lazygit at the target user's config.",
    checks: [{ name: "lazygit.config", relativePath: ".config/lazygit/config.yml" }]
  },
  {
    name: "tig",
    command: "tig",
    description: "Points tig at the target user's tigrc.",
    checks: [{ name: "tig.rc", relativePath: ".tigrc" }]
  },
  {
    name: "tmuxinator",
    command: "tmuxinator",
    description: "Points tmuxinator at the target user's config directory.",
    checks: [{ name: "tmuxinator.config", relativePath: ".config/tmuxinator" }]
  },

  // --- Databases ---
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
  },

  // --- Security & secrets ---
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

  // --- Misc dev tools ---
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
