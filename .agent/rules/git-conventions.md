# Git & Commits Conventions

Enforce these version control guidelines for repository operations.

---

## 🌿 Branch Naming Rules

Always use lowercase and separate words with hyphens. Prefix branch names by their target category:

- **Features**: `feature/<issue-number>-<short-description>` (e.g. `feature/123-oauth-login`).
- **Bugfixes**: `bugfix/<issue-number>-<short-description>` (e.g. `bugfix/456-token-expiration`).
- **Hotfixes**: `hotfix/<short-description>` (e.g. `hotfix/db-leak`).
- **Chore/Release**: `chore/version-bump` or `release/vX.Y.Z`.

---

## ✍️ Commit Guidelines

- Commit messages must follow Conventional Commits formatting:
  `<type>(<scope>): <description>`
- Limit the subject line to 50 characters, and capitalize the first word.
- Do not end the subject line with a period.
- Use the imperative mood (e.g. "add login endpoint" instead of "added login endpoint" or "adds login endpoint").

---

## 🔀 Pull Request Rules

- A PR should be scoped to a single feature or bug fix. Avoid packing unrelated changes together.
- Update documentation files (`docs/`, `README.md`) if changes impact APIs or setups.
- Do not self-merge PRs without a Peer Review and CI green checks approval.
