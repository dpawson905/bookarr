#!/bin/bash

# Docker Hub push script for Bookarr
# Usage: ./scripts/docker-push.sh [tag]

set -e

# Get version from package.json or use provided tag
if [ -z "$1" ]; then
    VERSION=$(node -p "require('./package.json').version")
    TAG="v${VERSION}"
else
    TAG="$1"
fi

IMAGE_NAME="dpawson905/bookarr"
FULL_TAG="${IMAGE_NAME}:${TAG}"
LATEST_TAG="${IMAGE_NAME}:latest"

echo "🚀 Building and pushing Bookarr to Docker Hub..."
echo "📦 Image: ${FULL_TAG}"
echo "🏷️  Tag: ${TAG}"

# Build the image
echo "🔨 Building Docker image..."
docker build -t "${FULL_TAG}" -t "${LATEST_TAG}" .

# Push to Docker Hub
echo "📤 Pushing to Docker Hub..."
docker push "${FULL_TAG}"
docker push "${LATEST_TAG}"

echo "✅ Successfully pushed to Docker Hub!"
echo "🐳 Pull with: docker pull ${FULL_TAG}"
echo "🐳 Or latest: docker pull ${LATEST_TAG}"
