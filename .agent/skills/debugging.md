# Skill: Debugging Task

Use this prompt/workflow when asked to investigate bugs, error logs, or crashes.

---

## 🔍 Diagnostic Process

Follow this sequence to trace and resolve bugs:

1. **Locate the Error**:
   - Inspect stack traces to identify the exact file name and line number range.
   - Look for database exceptions, null-pointer access, or API route mismatch.
2. **Reproduce the Bug**:
   - Write a failing unit/integration test case replicating the input payloads or database state described in the issue.
   - Run the reproduction test locally using:
     ```bash
     pnpm run test <test-file-path>
     ```
3. **Trace and Fix**:
   - Follow variables states using print/console logs or inspectors.
   - Ensure the solution resolves the root cause, rather than just handling the immediate symptom.
4. **regression Verification**:
   - Re-run all tests to ensure the fix does not break other modules or modules dependencies.
