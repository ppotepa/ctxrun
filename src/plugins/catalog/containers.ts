import { CatalogEntry } from "./types.js";

/** Container & Kubernetes tooling. */
export const containersCatalog: CatalogEntry[] = [
  {
    name: "docker",
    command: "docker",
    description: "Points Docker CLI at the target user's config and credential store.",
    env: { DOCKER_CONFIG: ".docker" },
    checks: [{ name: "docker.config", relativePath: ".docker/config.json" }]
  },
  {
    name: "kubectl",
    command: "kubectl",
    description: "Points kubectl at the target user's kubeconfig.",
    env: { KUBECONFIG: ".kube/config" },
    checks: [{ name: "kubectl.config", relativePath: ".kube/config" }]
  },
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
  }
];
