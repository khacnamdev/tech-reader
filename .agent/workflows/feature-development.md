# Workflow: Feature Development

This checklist guides developers and AI agents through the feature development process.

---

## 📋 Feature Checklist

Follow these steps sequentially:

### Phase 1: Planning & Setup
- [ ] Ensure you are on the `develop` branch and have pulled the latest changes.
- [ ] Create a new feature branch matching naming conventions (e.g. `feature/123-user-profile`).
- [ ] Review requirement specs and list architectural dependencies.

### Phase 2: Design & Implementation
- [ ] Create/Update TypeScript definitions first inside src layer.
- [ ] Implement business use cases, separating concerns from presentation layers.
- [ ] Ensure code complies with [.agent/rules/coding-style.md](file:///../rules/coding-style.md).

### Phase 3: Testing & Linting
- [ ] Add unit test suites covering edge cases and success states.
- [ ] Run typechecks and lint checks locally:
  ```bash
  pnpm run lint
  pnpm run typecheck
  pnpm run test
  ```

### Phase 4: PR & Review
- [ ] Commit changes with conventional messages, push branch to origin.
- [ ] Open a Pull Request targeting `develop` using the [PULL_REQUEST_TEMPLATE](file:///../../.github/PULL_REQUEST_TEMPLATE.md).
- [ ] Address review feedback, resolve conversations, and merge.
