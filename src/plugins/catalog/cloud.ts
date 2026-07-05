import { CatalogEntry } from "./types.js";

/** Cloud provider & infrastructure-as-code CLIs. */
export const cloudCatalog: CatalogEntry[] = [
  {
    name: "aws",
    command: "aws",
    description: "Points AWS CLI at the target user's credentials and config files.",
    env: {
      AWS_SHARED_CREDENTIALS_FILE: ".aws/credentials",
      AWS_CONFIG_FILE: ".aws/config"
    },
    checks: [
      { name: "aws.credentials", relativePath: ".aws/credentials" },
      { name: "aws.config", relativePath: ".aws/config" }
    ]
  },
  {
    name: "gcloud",
    command: "gcloud",
    description: "Points Google Cloud CLI at the target user's config directory.",
    env: { CLOUDSDK_CONFIG: ".config/gcloud" },
    checks: [{ name: "gcloud.activeConfig", relativePath: ".config/gcloud/active_config" }]
  },
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
  }
];
