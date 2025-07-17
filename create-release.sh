#!/bin/bash

# Script to create a new git tag and GitHub release
# Usage: ./create-release.sh [options]

set -e # Exit on any error

type=$1 # major, minor, patch

if [ -z "$type" ]; then
  echo "No type specified"
  echo "Usage: ./create-release.sh [major|minor|patch]"
  exit 1
fi

if [ "$type" != "major" ] && [ "$type" != "minor" ] && [ "$type" != "patch" ]; then
  echo "Invalid type specified"
  exit 1
fi

npm version patch --workspaces --include-workspace-root true --no-git-tag-version

# Get version from package.json
VERSION=$(jq -r '.version' package.json)

echo "New version: $VERSION"

npm run build
npm run build:sea

git add .
git commit -m "Release $VERSION"
git tag v$VERSION
git push --tag
git push

echo "Creating release for tag v$VERSION"

gh release create v$VERSION ./sea/web-scraper --notes-from-tag --title "Release $VERSION"
