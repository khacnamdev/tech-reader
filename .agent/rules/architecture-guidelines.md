# System Architecture Guidelines

Maintain these system design layouts when modifying the code structures.

---

## 🏛️ Dependency Flow

To keep modules loosely coupled and testable, the source code should maintain a **one-way dependency direction**:

* Controllers/Resolvers depend on Use Cases / Services.
* Services depend on Repository/Infrastructure interfaces.
* Infrastructure classes implement Domain Interfaces (Dependency Inversion).
* **The Domain layer must remain free of dependencies**. It must not import any modules from Infrastructure, Services, or Framework libraries (like database drivers or HTTP frameworks).

---

## 🔒 Data-Transfer Objects (DTOs) & Validation

1. **Incoming requests**: Always use validated DTOs at HTTP controller entrance boundaries. For NestJS, use class-validator/zod. For Express/NextJS, validate inputs explicitly with a validator middleware before reaching business layers.
2. **Strict Typings**: Do not pass raw HTTP bodies (e.g. `req.body` typed as `any`) deeper than controllers. Convert them to strongly typed schemas immediately.

---

## 💉 Dependency Injection

- Avoid initializing classes directly using `new ServiceName()` within other services.
- Use framework-level dependency injection (NestJS providers) or construct dependencies at application bootstrap entry points (Express/React context).
- This ensures dependencies can be easily replaced by mock instances during unit testing.
