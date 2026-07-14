# Skill: Testing Guidelines

Follow these guidelines when creating unit, integration, or E2E tests.

---

## 🧪 Structure: AAA Pattern (Arrange-Act-Assert)

Organize each test block clearly into three phases:

```typescript
test("should calculate transaction total with tax", () => {
  // Arrange (Setup variables, database states, mock functions)
  const items = [{ price: 100, qty: 2 }];
  const taxRate = 0.1;

  // Act (Execute the target function)
  const total = calculateTotal(items, taxRate);

  // Assert (Verify the output matches expectations)
  expect(total).toBe(220);
});
```

---

## 📦 Mocking Best Practices

- **External Web APIs**: Mock HTTP responses using libraries like `msw` (Mock Service Worker) or mock class adapters. Never hit live production/sandbox web endpoints during automated runs.
- **Databases**: Use transaction-based rollbacks or mock repositories when running unit tests. Avoid hitting actual databases unless running integration/E2E test pipelines.

---

## 📊 Coverage Standards

- Ensure all critical business logic services achieve a minimum of **80% coverage**.
- Run coverage validation locally with:
  ```bash
  pnpm run test:coverage
  ```
