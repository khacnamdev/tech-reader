# Workflow: Bug Fix

Follow this workflow checklist when investigating and resolving bugs.

---

## 📋 Bug Resolution Checklist

### Phase 1: Investigation
- [ ] Create a bugfix branch (e.g. `bugfix/321-crash-on-invalid-jwt`).
- [ ] Inspect error logs, track down code lines, and find root cause details.

### Phase 2: Reproduction
- [ ] Write a failing unit or integration test simulating the error conditions.
- [ ] Run the test to confirm reproduction:
  ```bash
  pnpm run test <test-file-path>
  ```

### Phase 3: Resolution
- [ ] Implement code changes to fix the issue.
- [ ] Verify that your reproduction test passes successfully.
- [ ] Run overall tests and quality suites to avoid regressions:
  ```bash
  pnpm run lint
  pnpm run typecheck
  pnpm run test
  ```

### Phase 4: Submit PR
- [ ] Push the bugfix branch.
- [ ] Open a Pull Request targeting `develop`. Link the related issue (e.g. `Fixes #321`).
