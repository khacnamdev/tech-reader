# Local Development Guide

This guide provides instructions on how to set up, configure, and develop inside this repository.

---

## 📋 Prerequisites

Before starting development, ensure you have the following tools installed on your local machine:

1. **Node.js**: Version defined in [.nvmrc](file:///.nvmrc) (Active LTS `v20.15.0`). We recommend using [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm) to manage Node versions.
   ```bash
   nvm use
   ```
2. **pnpm**: Version `v9+`. Install it globally via npm:
   ```bash
   npm install -g pnpm
   ```

---

## 🚀 Getting Started

### 1. Initialize the Environment
We provide a helper script to automate copying environment templates, verifying engines, and setting up workspace options:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 2. Install Dependencies
Install packages with frozen lockfile parameters to prevent changes to your dependency trees:
```bash
pnpm install
```

### 3. Verify Local Checks
Ensure your environment is configured correctly by running the verification suite:
```bash
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```

---

## 🛠️ Development Scripts

Use these standard scripts during feature development:

- `pnpm run dev`: Launch the dev server (adjust script inside [package.json](file:///package.json) once a specific framework is adopted).
- `pnpm run lint`: Analyzes codebase with ESLint rules.
- `pnpm run lint:fix`: Automatically repairs autofixable linting issues.
- `pnpm run format`: Applies Prettier code-formatting layout across JS/TS/MD/YAML files.
- `pnpm run format:check`: Validates formatting standards without applying changes (used in CI).
- `pnpm run typecheck`: Validates TypeScript strict typing structures.
- `pnpm run test`: Executes unit and integration test suites using Vitest.
- `pnpm run build`: Compiles production assets.

---

## 🧩 IDE Setup Guidelines

### VS Code Recommended Extensions
We recommend installing the following extensions to match workspace configuration styles:
* **ESLint** (`dbaeumer.vscode-eslint`)
* **Prettier - Code formatter** (`esbenp.prettier-vscode`)
* **EditorConfig for VS Code** (`EditorConfig.EditorConfig`)

### Workspace Settings
The repository contains [.editorconfig](file:///.editorconfig) and [.prettierrc](file:///.prettierrc) settings, which your editor should automatically apply. Enable "Format on Save" in your IDE options for smooth formatting integrations.
