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
  
  if [ "$VERSION" = "latest" ]; then
    sudo npm install -g ctxrun
  else
    sudo npm install -g "ctxrun@$VERSION"
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
    return 1
  fi

  print_info "Installing ctxrun via .deb..."
  
  local temp_deb=$(mktemp)
  trap "rm -f $temp_deb" EXIT
  
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
    return 1
  fi

  print_info "Installing ctxrun via tarball..."
  
  local temp_tar=$(mktemp)
  trap "rm -f $temp_tar" EXIT
  
  curl -fsSL -o "$temp_tar" "$tarball_url"
  
  local extract_dir="/usr/local/lib/ctxrun"
  sudo mkdir -p "$extract_dir"
  sudo tar -xzf "$temp_tar" -C "$extract_dir" --strip-components=1
  
  # Create wrapper in /usr/local/bin
  sudo tee "$INSTALL_DIR/ctxrun" > /dev/null << 'WRAPPER'
#!/bin/bash
exec node /usr/local/lib/ctxrun/dist/cli/index.js "$@"
WRAPPER
  sudo chmod +x "$INSTALL_DIR/ctxrun"
  
  print_success "ctxrun installed via tarball"
  print_info "Command: ctxrun"
  print_info "Run: ctxrun --help"
  return 0
}

main() {
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
  
  # Try installation methods in order of preference
  if install_via_npm; then
    return 0
  fi
  
  if install_via_deb; then
    return 0
  fi
  
  if install_via_tarball; then
    return 0
  fi
  
  print_error "Installation failed: no compatible method available"
  print_info "Please install Node.js >=20 first"
  exit 1
}

main "$@"
