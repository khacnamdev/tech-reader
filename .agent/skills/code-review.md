# Skill: Code Review Task

Use this prompt/workflow when asked to review code changes or PR diffs.

---

## 🔍 Code Review Prompt Guidelines

Analyze the code changes and provide feedback structured in three categories:
1. **Critical/Security Issues**: Security leaks, raw query injections, unvalidated input arrays, database connection leaks, credentials hardcoding.
2. **Architecture & Optimization**: Cognitive complexity, performance bottlenecks, unnecessary loops, missing caches, API coupling.
3. **Typing & Styling**: Missing type definitions, syntax violations, formatting discrepancies, naming mismatches.

---

## 📋 Evaluation Checklist

Verify the following before approving:
- [ ] No hardcoded configuration values or credentials.
- [ ] No `any` type overrides in TS files.
- [ ] Async/Await blocks catch errors using try-catch blocks.
- [ ] Functions are short (ideally <= 40 lines of code).
- [ ] Unit tests are added or updated to cover modified execution paths.
