# AI Agent System Instructions

This directory structure (`.agent/`) contains guidelines, operational skills, and standardized workflows to instruct AI coding assistants (such as GitHub Copilot, Cursor, Gemini, and ChatGPT) during pair programming sessions.

---

## 📂 System Structure

The instructions are split into three categories:

1. **`rules/`**: Style guides, static constraints, and general standards.
   - [coding-style.md](file:///.agent/rules/coding-style.md): Formatting, naming, and linting rules.
   - [architecture-guidelines.md](file:///.agent/rules/architecture-guidelines.md): Clean architecture layers and design patterns.
   - [git-conventions.md](file:///.agent/rules/git-conventions.md): Commit messages formats and branching guidelines.

2. **`skills/`**: Active operational instructions.
   - [code-review.md](file:///.agent/skills/code-review.md): Standard prompts for analyzing code complexity and quality.
   - [debugging.md](file:///.agent/skills/debugging.md): Diagnostic runbooks for fixing stack trace issues.
   - [testing.md](file:///.agent/skills/testing.md): Rules for authoring unit, integration, and E2E mock suites.

3. **`workflows/`**: Process-based checklists.
   - [feature-development.md](file:///.agent/workflows/feature-development.md): Feature development lifecycle workflow.
   - [bug-fix.md](file:///.agent/workflows/bug-fix.md): Bug investigation and fixing workflow.
   - [release-process.md](file:///.agent/workflows/release-process.md): Automated tags and release notes compilation checklist.

---

## 🤖 How to use as an AI Assistant

When executing a task in this repository, you **MUST**:
1. Scan `.agent/rules/` before writing any codebase changes to align with formatting and design standards.
2. Read the appropriate workflow from `.agent/workflows/` depending on the user's request (e.g. follow the feature development workflow when adding capabilities).
3. Utilize the definitions in `.agent/skills/` to structure testing, review, or debug outputs.
