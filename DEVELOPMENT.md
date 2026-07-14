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

### 1. Configure the Environment
Ensure your local PostgreSQL database is running. Create your local configurations file:
```bash
cp .env.example .env
```

### 2. Install Dependencies
Run from the root of the workspace:
```bash
pnpm install
```

### 3. Run Database Migrations
Generate database tables and synchronize database types matching the Prisma schema:
```bash
pnpm --filter backend exec prisma db push
```

### 4. Verify Local Builds & Linting
Ensure type safety and quality standards pass:
```bash
# Check TypeScript across the whole monorepo
pnpm run typecheck

# Run linters
pnpm run lint

# Run unit tests (Vitest)
pnpm run test
```

---

## 🛠️ Monorepo Development Scripts

We leverage `pnpm` workspace filters to run commands targeting specific modules:

*   **Launch Development Servers**:
    *   Backend (NestJS API on port 3001): `pnpm --filter backend start:dev`
    *   Frontend (Next.js App on port 3000): `pnpm --filter frontend dev`
*   **Database Management**:
    *   Generate client code: `pnpm --filter backend exec prisma generate`
    *   Open Prisma Studio dashboard: `pnpm --filter backend exec prisma studio`
*   **Formatting and Styling**:
    *   Run Prettier format fix: `pnpm run format`
    *   Check format standards: `pnpm run format:check`
*   **Testing and Type Checks**:
    *   Check static types: `pnpm run typecheck`
    *   Run test suite (Vitest): `pnpm run test`
    *   Compile production builds: `pnpm run build`

---

## 🧩 IDE Setup Guidelines

### VS Code Recommended Extensions
We recommend installing the following extensions to match workspace configuration styles:
* **ESLint** (`dbaeumer.vscode-eslint`)
* **Prettier - Code formatter** (`esbenp.prettier-vscode`)
* **EditorConfig for VS Code** (`EditorConfig.EditorConfig`)

### Workspace Settings
The repository contains [.editorconfig](file:///.editorconfig) and [.prettierrc](file:///.prettierrc) settings, which your editor should automatically apply. Enable "Format on Save" in your IDE options for smooth formatting integrations.
