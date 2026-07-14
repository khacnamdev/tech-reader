#!/usr/bin/env bash

# Setup bootstrap script for developer onboarding
set -euo pipefail

# ANSI color codes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Starting engineering-template environment setup...${NC}\n"

# 1. Verify Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js (v20+) before proceeding.${NC}"
    exit 1
fi

REQUIRED_NODE_VERSION=$(cat .nvmrc)
CURRENT_NODE_VERSION=$(node -v | sed 's/v//')

echo -e "Checking Node.js version..."
if [[ "$CURRENT_NODE_VERSION" != "$REQUIRED_NODE_VERSION"* ]]; then
    echo -e "${YELLOW}⚠️  Node version mismatch! Expected v${REQUIRED_NODE_VERSION}, but found v${CURRENT_NODE_VERSION}.${NC}"
    echo -e "We recommend running 'nvm use' or 'fnm use' to switch Node versions."
else
    echo -e "${GREEN}✅ Node.js version matches .nvmrc (v${REQUIRED_NODE_VERSION})${NC}"
fi

# 2. Verify pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠️  pnpm is not installed. Installing pnpm globally...${NC}"
    npm install -g pnpm
else
    echo -e "${GREEN}✅ pnpm is installed: $(pnpm -v)${NC}"
fi

# 3. Setup environment variables
if [ ! -f .env ]; then
    echo -e "Configuring .env file from .env.example..."
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file.${NC}"
else
    echo -e "${YELLOW}ℹ️  .env file already exists. Skipping copy.${NC}"
fi

# 4. Install dependencies
echo -e "Installing project dependencies..."
pnpm install --frozen-lockfile

# 5. Setup local git configs
echo -e "Configuring local git hooks..."
git config core.hooksPath .githooks || true

echo -e "\n${GREEN}🎉 Setup completed successfully! Run 'pnpm run dev' to start developing.${NC}"
