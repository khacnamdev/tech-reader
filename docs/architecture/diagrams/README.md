# System Diagrams Directory

Use this directory to store visual representations of system architectures, data flows, and database schemas.

## 🎨 Tooling Guidelines

We recommend using the following tools for diagrams:

1. **Mermaid.js (Recommended)**: Fenced code blocks with `mermaid` tag. These render natively in GitHub and markdown viewers.
2. **Excalidraw**: Save both the raw JSON file (`diagram-name.excalidraw`) and export a static image (`diagram-name.png` or `.svg`) for inclusion in documents.
3. **draw.io / Lucidchart**: Export as `.png` or vector `.svg` files.

---

## 📈 Sample Flow (Mermaid)

```mermaid
sequenceDiagram
    actor User
    participant Client as Frontend Client
    participant API as Gateway/Server
    participant DB as Postgres Database

    User->>Client: Clicks "Submit Transaction"
    Client->>API: POST /transactions (Bearer JWT)
    Note over API: Middleware verifies JWT<br/>and checks scopes
    API->>DB: INSERT INTO transactions...
    DB-->>API: returns inserted row
    API-->>Client: HTTP 201 Created (JSON payload)
    Client-->>User: Show success animation
```
