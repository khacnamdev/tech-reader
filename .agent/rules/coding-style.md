# Coding Style & Linting Guidelines

Follow these coding style standards when developing JavaScript/TypeScript code.

---

## 🏗️ General Standards

1. **TypeScript First**:
   - Every file must be written in TypeScript (`.ts` or `.tsx` for React).
   - Avoid using the type `any`. If a generic type is required, use `unknown` or configure explicit generics.
   - Use strict type-safety rules. Every public interface or function signature must have explicit typing declarations.

2. **Clean Code Practices**:
   - Keep functions small and focused on a single responsibility (Single Responsibility Principle).
   - Prefer early returns to reduce indentation depth:
     ```typescript
     // Recommended
     if (!userId) {
       throw new ValidationError("User ID is required");
     }
     const user = await userRepository.find(userId);
     ```
   - Avoid hardcoding values. Use constants stored in config files or class definitions.

---

## 🔠 Naming Conventions

- **Variables & Functions**: `camelCase` (e.g. `getUserById`, `isEmailValidated`).
- **Classes, Types, Interfaces**: `PascalCase` (e.g. `AuthService`, `UserPayload`).
- **Constants & Enums**: `UPPER_SNAKE_CASE` (e.g. `DEFAULT_PORT`, `HTTP_STATUS_OK`).
- **Files & Directories**: `kebab-case` (e.g. `auth-service.ts`, `user-controller.ts`).

---

## 💅 Formatting Guidelines

Formatting is automated using Prettier. Do not apply manual visual formatting overrides.
- Indent: 2 spaces.
- Line endings: `lf` (Unix style).
- Quotes: Double quotes (`"`) except for template literals where variables interpolation is required.
- Semicolons: Always include ending semicolons (`semi: true`).
