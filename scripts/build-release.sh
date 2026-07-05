#!/bin/bash
# Build and release ctxrun - creates npm tarball, .deb, and SHA256SUMS
set -euo pipefail

# Get version from package.json
VERSION=$(jq -r '.version' package.json)
RELEASE="${RELEASE:-1}"

echo "Building ctxrun v${VERSION}-${RELEASE}..."

# Create output directory
mkdir -p dist/release

# Build the code first
npm run build

# Create npm tarball
npm pack --pack-destination dist/release

# Create a staging directory for .deb
STAGING=$(mktemp -d)
trap "rm -rf '$STAGING'" EXIT

mkdir -p "$STAGING/usr/lib/ctxrun" "$STAGING/usr/bin"

# Copy files to staging
cp -r dist "$STAGING/usr/lib/ctxrun/"
cp package.json LICENSE README.md "$STAGING/usr/lib/ctxrun/"

# Create wrapper script
# Preserve SUDO_USER so ctxrun can detect the real user when run via sudo
cat > "$STAGING/usr/bin/ctxrun" << 'WRAPPER'
#!/bin/bash
export SUDO_USER="${SUDO_USER:-}"
exec node /usr/lib/ctxrun/dist/cli/index.js "$@"
WRAPPER
chmod +x "$STAGING/usr/bin/ctxrun"

# Build .deb using fpm (if available)
if command -v fpm &> /dev/null; then
  fpm -s dir -t deb \
    --name ctxrun \
    --version "${VERSION}" \
    --release "${RELEASE}" \
    --architecture all \
    --description "Run commands with an explicit user context across sudo/root boundaries." \
    --url "https://github.com/ppotepa/ctxrun" \
    --license MIT \
    --maintainer "Paweł Potępa <pawel.potepa@hotmail.com>" \
    --depends "nodejs (>= 20)" \
    -C "$STAGING" \
    -p "dist/release/ctxrun_${VERSION}-${RELEASE}_all.deb"
  echo "✓ Built .deb package"
else
  echo "⚠ fpm not installed, skipping .deb build"
fi

# Generate SHA256SUMS
echo "✓ Generating SHA256SUMS..."
cd dist/release
sha256sum * > SHA256SUMS
cd - > /dev/null

echo ""
echo "✓ Build artifacts in dist/release:"
ls -lh dist/release/

echo ""
echo "✓ SHA256SUMS:"
cat dist/release/SHA256SUMS

echo ""
echo "To publish to GitHub Releases:"
echo "  gh release create v${VERSION} dist/release/* --notes 'Release v${VERSION}'"
