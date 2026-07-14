# Workflow: Release Process

Follow this workflow checklist when releasing new versions of the software.

---

## 📋 Release Checklist

### Phase 1: Pre-Release Verification
- [ ] Checkout the `develop` branch and pull latest commits.
- [ ] Run complete build check verification suites locally:
  ```bash
  pnpm install
  pnpm run lint
  pnpm run typecheck
  pnpm run test
  pnpm run build
  ```

### Phase 2: Version Bump & Tagging
- [ ] Run the automated release script:
  ```bash
  ./scripts/release.sh
  ```
- [ ] When prompted, supply the target Semantic Version number (e.g. `1.2.0`).
- [ ] The script will bump package settings, append tag, and update [CHANGELOG.md](file:///../../CHANGELOG.md).

### Phase 3: Publish & Promotion
- [ ] Push tags and branch updates:
  ```bash
  git push origin develop --tags
  ```
- [ ] The CI/CD tag workflow will run automatically, create a GitHub Release, compile assets, and generate notes.
- [ ] Merge the promotion PR to merge `develop` changes into `staging`, and then `staging` to `main`.
