# Contributing Guidelines

Thank you for contributing to this project! To maintain a high level of engineering quality and smooth collaboration, we follow these git, commit, and review workflows.

---

## 🌿 Branching Strategy

We follow a structured Git branching model to isolate development, staging testing, and production states.

```mermaid
gitGraph
  commit id: "v1.0.0" tag: "v1.0.0"
  branch develop
  checkout develop
  commit id: "Setup core configs"
  branch feature/login
  checkout feature/login
  commit id: "feat: add auth UI"
  commit id: "feat: api integration"
  checkout develop
  merge feature/login
  branch staging
  checkout staging
  merge develop id: "chore(release): promote develop to staging"
  checkout main
  merge staging tag: "v1.1.0" id: "chore(release): promote staging to main"
```

### Branches & Purpose
1. **`main`**: Production code. Must always be stable. Direct commits are blocked. Changes are merged only from `staging` via automated or approved Pull Requests.
2. **`staging`**: Release candidate / pre-production testing branch. Merged from `develop` automatically or via PRs. Automated QA/E2E testing is run here.
3. **`develop`**: Integration branch for new features and bug fixes. Developers create pull requests targeting `develop`.
4. **`feature/*` / `bugfix/*` / `hotfix/*`**: Temporary working branches created by developers. All work must be completed on these branches before submitting a Pull Request.

---

## ✍️ Commit Conventions

We enforce [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) to automate versioning and generate clear release notes.

### Commit Message Format
```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Common Types:
- **`feat`**: A new feature (bypasses patch, triggers minor version update).
- **`fix`**: A bug fix (triggers patch version update).
- **`docs`**: Documentation changes only.
- **`style`**: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc).
- **`refactor`**: A code change that neither fixes a bug nor adds a feature.
- **`perf`**: A code change that improves performance.
- **`test`**: Adding missing tests or correcting existing tests.
- **`build`**: Changes that affect the build system or external dependencies.
- **`ci`**: Changes to our CI configuration files and scripts.
- **`chore`**: Other changes that don't modify src or test files.

### Examples:
- `feat(auth): add login with multi-factor authentication`
- `fix(api): handle empty array response on catalog API`
- `chore(release): promote develop to staging`

---

## 🔀 Pull Request Workflow

1. **Submit early**: If you want feedback, open a draft Pull Request.
2. **Title**: Ensure your PR title matches the conventional commit format (e.g. `feat(payments): integrate Stripe checkout`).
3. **Describe**: Fill out the [Pull Request Template](file:///.github/PULL_REQUEST_TEMPLATE.md) completely.
4. **Self-Review**: Look at your own changes before requesting a review.
5. **Resolve Checks**: Ensure all CI status checks (Lint, Typecheck, Tests, Build) pass successfully.

---

## 🔍 Code Review Guidelines

- **Mandatory Approval**: All PRs targeting `develop`, `staging`, or `main` require at least one approving review from codeowners.
- **Constructive Feedback**: Be respectful and detailed in review comments. Explain *why* a change is suggested.
- **Resolving Conversations**: Only the reviewer who opened a conversation should resolve it, after verifying that the requested changes have been addressed.
- **Urgent Fixes**: Hotfixes targeting `main` can be fast-tracked but must still pass CI checks and be reviewed by a lead engineer.
