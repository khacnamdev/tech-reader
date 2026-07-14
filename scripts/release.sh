#!/usr/bin/env bash

# Release automation script
set -euo pipefail

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}📦 Preparing release version...${NC}\n"

# Ensure we are on clean working tree
if [[ -n $(git status --porcelain) ]]; then
  echo -e "${RED}❌ Working directory is dirty! Please commit or stash your changes before releasing.${NC}"
  exit 1
fi

# Fetch current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "Current package version: ${YELLOW}v${CURRENT_VERSION}${NC}"

# Prompt for new version
echo -e "Enter new Semantic Version (e.g. 1.1.0): "
read -r NEW_VERSION

# Validation of version regex
SEMVER_REGEX="^[0-9]+\.[0-9]+\.[0-9]+$"
if [[ ! $NEW_VERSION =~ $SEMVER_REGEX ]]; then
  echo -e "${RED}❌ Invalid semantic version format! Must match X.Y.Z (e.g. 1.0.1)${NC}"
  exit 1
fi

echo -e "Bumping package version to ${GREEN}v${NEW_VERSION}${NC}..."

# Update version in package.json
# Note: npm version bumps the version and staging files automatically.
# We will use pnpm to bump, which also updates lockfile if necessary.
pnpm version "$NEW_VERSION" --no-git-tag-version

# Update CHANGELOG.md section title (replace Unreleased with the version and date)
RELEASE_DATE=$(date +%Y-%m-%d)
CHANGELOG_FILE="CHANGELOG.md"

if [ -f "$CHANGELOG_FILE" ]; then
  # Replace ## [Unreleased] with ## [NEW_VERSION] - RELEASE_DATE and recreate the Unreleased section header
  # Use a temp file for cross-platform compatibility with sed
  sed -i "s/## \[Unreleased\]/## [Unreleased]\n\n---\n\n## [${NEW_VERSION}] - ${RELEASE_DATE}/" "$CHANGELOG_FILE"
  echo -e "${GREEN}✅ Updated CHANGELOG.md.${NC}"
fi

# Commit and Tag
git add package.json CHANGELOG.md
if [ -f pnpm-lock.yaml ]; then
  git add pnpm-lock.yaml
fi

git commit -m "chore(release): release v${NEW_VERSION}"
git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"

echo -e "\n${GREEN}🎉 Version bumped and Tag created successfully!${NC}"
echo -e "Review changes and push to origin using:"
echo -e "   ${YELLOW}git push origin develop --tags${NC}"
