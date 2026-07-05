#!/bin/bash
# Build and release ctxrun - creates .deb, tarball, and SHA256SUMS
set -euo pipefail

# Get version from package.json
VERSION=$(jq -r '.version' package.json)
RELEASE="${RELEASE:-1}"

echo "Building ctxrun v${VERSION}-${RELEASE}..."

# Create output directory
mkdir -p dist/release

# Build .deb and tarballs in Docker
docker build \
  -f Dockerfile.release \
  -t ctxrun-builder \
  --build-arg VERSION="${VERSION}" \
  --build-arg RELEASE="${RELEASE}" \
  .

# Extract artifacts from Docker image
docker run --rm \
  -v "$(pwd)/dist/release:/dist/release" \
  ctxrun-builder

echo "✓ Build artifacts in dist/release:"
ls -lh dist/release/

echo ""
echo "✓ SHA256SUMS:"
cat dist/release/SHA256SUMS

echo ""
echo "To publish to GitHub Releases:"
echo "  gh release create v${VERSION} dist/release/* --draft --notes 'Release v${VERSION}'"
