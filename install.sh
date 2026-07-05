#!/bin/bash
# ctxrun installer - https://github.com/ppotepa/ctxrun
# Usage: curl -fsSL https://raw.githubusercontent.com/ppotepa/ctxrun/main/install.sh | bash
set -euo pipefail

VERSION="${1:-latest}"
INSTALL_DIR="${INSTALL_DIR:-/usr/local/bin}"

print_error() {
  echo "❌ Error: $*" >&2
}

print_info() {
  echo "ℹ️  $*"
}

print_success() {
  echo "✅ $*"
}

# Detect OS and architecture
detect_system() {
  local os arch
  
  case "$(uname -s)" in
    Linux*)  os="linux" ;;
    Darwin*) os="macos" ;;
    *)       os="unknown" ;;
  esac

  case "$(uname -m)" in
    x86_64)  arch="x64" ;;
    arm64|aarch64) arch="arm64" ;;
    *)       arch="unknown" ;;
  esac

  echo "$os:$arch"
}

install_via_npm() {
  if ! command -v npm &> /dev/null; then
    return 1
  fi

  print_info "Installing ctxrun via npm..."
  
  # npm and Node require a valid cwd. cd to a safe dir in case the shell was
  # launched from a directory that no longer exists (e.g. curl | bash).
  local safe_dir="${HOME:-/tmp}"
  pushd "$safe_dir" > /dev/null 2>&1 || cd /tmp

  local npm_exit=0
  if [ "$VERSION" = "latest" ]; then
    sudo npm install -g ctxrun || npm_exit=$?
  else
    sudo npm install -g "ctxrun@$VERSION" || npm_exit=$?
  fi

  popd > /dev/null 2>&1 || true

  if [ "$npm_exit" -ne 0 ]; then
    print_info "npm install failed (exit $npm_exit), trying next method..."
    return 1
  fi

  print_success "ctxrun installed via npm"
  print_info "Command: ctxrun"
  print_info "Run: ctxrun --help"
  return 0
}

install_via_deb() {
  if ! command -v dpkg &> /dev/null; then
    return 1
  fi

  local deb_url
  if [ "$VERSION" = "latest" ]; then
    # Fetch latest release from GitHub
    deb_url=$(curl -fsSL https://api.github.com/repos/ppotepa/ctxrun/releases/latest \
      | grep -oP '"browser_download_url": "\K[^"]*_all\.deb' | head -1)
  else
    deb_url="https://github.com/ppotepa/ctxrun/releases/download/v${VERSION}/ctxrun_${VERSION}-1_all.deb"
  fi

  if [ -z "$deb_url" ]; then
    print_info "No .deb found in release, trying next method..."
    return 1
  fi

  print_info "Installing ctxrun via .deb..."
  
  local temp_deb
  temp_deb=$(mktemp /tmp/ctxrun-XXXXXX.deb)
  trap "rm -f '$temp_deb'" RETURN
  
  curl -fsSL -o "$temp_deb" "$deb_url"
  sudo dpkg -i "$temp_deb"
  
  print_success "ctxrun installed via .deb"
  print_info "Command: ctxrun"
  print_info "Run: ctxrun --help"
  return 0
}

install_via_tarball() {
  if ! command -v tar &> /dev/null || ! command -v curl &> /dev/null; then
    return 1
  fi

  local tarball_url
  if [ "$VERSION" = "latest" ]; then
    tarball_url=$(curl -fsSL https://api.github.com/repos/ppotepa/ctxrun/releases/latest \
      | grep -oP '"browser_download_url": "\K[^"]*\.tgz' | head -1)
  else
    tarball_url="https://github.com/ppotepa/ctxrun/releases/download/v${VERSION}/ctxrun-v${VERSION}.tar.gz"
  fi

  if [ -z "$tarball_url" ]; then
    print_info "No tarball found in release, trying next method..."
    return 1
  fi

  print_info "Installing ctxrun via tarball..."
  
  local temp_tar
  temp_tar=$(mktemp /tmp/ctxrun-XXXXXX.tgz)
  trap "rm -f '$temp_tar'" RETURN
  
  curl -fsSL -o "$temp_tar" "$tarball_url"
  
  local extract_dir="/usr/local/lib/ctxrun"
  sudo mkdir -p "$extract_dir"
  sudo tar -xzf "$temp_tar" -C "$extract_dir" --strip-components=1
  
  # Wrapper preserves SUDO_USER so ctxrun can detect the real user via sudo.
  sudo tee "$INSTALL_DIR/ctxrun" > /dev/null << 'WRAPPER'
#!/bin/bash
export SUDO_USER="${SUDO_USER:-}"
exec node /usr/local/lib/ctxrun/dist/cli/index.js "$@"
WRAPPER
  sudo chmod +x "$INSTALL_DIR/ctxrun"
  
  print_success "ctxrun installed via tarball"
  print_info "Command: ctxrun"
  print_info "Run: ctxrun --help"
  return 0
}

main() {
  # Guard against broken cwd (e.g. when piped via curl from a deleted directory).
  # Node/npm require a valid working directory; /tmp is always safe.
  cd /tmp 2>/dev/null || true

  print_info "ctxrun installer (version: $VERSION)"
  
  local system
  system=$(detect_system)
  print_info "Detected system: $system"
  
  # Check if Node.js >= 20 is available
  if ! command -v node &> /dev/null; then
    print_error "Node.js is required but not installed"
    print_info "Install Node.js >=20 from https://nodejs.org/"
    exit 1
  fi
  
  local node_version
  node_version=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
  if [ "$node_version" -lt 20 ]; then
    print_error "Node.js >=20 is required (you have v$node_version)"
    exit 1
  fi
  
  # Try installation methods in order of preference.
  # Note: these functions are called directly (not inside 'if') so that
  # set -e applies correctly inside them. We use || to handle failures.
  install_via_npm && return 0 || true
  install_via_deb && return 0 || true
  install_via_tarball && return 0 || true
  
  print_error "Installation failed: no compatible method available"
  print_info "Please install Node.js >=20 first, then retry"
  exit 1
}

main "$@"
