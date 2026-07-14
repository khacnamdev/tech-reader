# Troubleshooting Runbook

This guide covers common issues and resolutions encountered during local development or CI/CD pipelines execution.

---

## 📦 Dependency & pnpm Issues

### 1. Lockfile Conflicts
**Symptom**: `pnpm install` fails due to conflicts inside `pnpm-lock.yaml`.
**Resolution**:
- Revert your local lockfile to matching branch master state.
- Run `pnpm install` again to let pnpm rebuild dependencies tree automatically.
- Avoid manual edits inside `pnpm-lock.yaml`.

### 2. Corrupted pnpm Cache
**Symptom**: Unexplained compile errors or missing modules.
**Resolution**:
- Clear the local pnpm store:
  ```bash
  pnpm store prune
  ```
- Re-install dependencies:
  ```bash
  rm -rf node_modules
  pnpm install
  ```

---

## 🛠️ Build & Types Check Failures

### 1. Out of Memory on Build
**Symptom**: `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory`.
**Resolution**:
Extend Node's memory heap sizes via scripts environments variables:
```bash
export NODE_OPTIONS="--max-old-space-size=4096"
pnpm run build
```

### 2. Type mismatch with external libraries
**Symptom**: `error TS2307: Cannot find module '...' or its corresponding type declarations.`
**Resolution**:
- Double-check if the package requires dev `@types/` configurations (e.g. `@types/node`).
- Verify module resolutions flags inside [tsconfig.json](file:///tsconfig.json). We use `NodeNext` to conform to modern ESM specifications.

---

## 🤖 CI/CD Errors

### 1. Branch Protection / PR Creation Failures
**Symptom**: The environment promotion workflow fails with `GitHub CLI: Pull request creation failed (403 / write permissions)`.
**Resolution**:
- Go to Repository **Settings** -> **Actions** -> **General** -> **Workflow permissions**.
- Set permissions to **Read and write permissions**.
- Alternatively, generate a Personal Access Token (PAT) with `repo` scopes and save it as `ADMIN_GITHUB_TOKEN` in repo secrets.

### 2. Release Tag exists
**Symptom**: Push to `v*` tag fails or release step warns that tag already exists.
**Resolution**:
Delete the local and remote tags, update the version in `package.json`, commit, and create a new tag.
```bash
git tag -d v1.0.0
git push --delete origin v1.0.0
```
