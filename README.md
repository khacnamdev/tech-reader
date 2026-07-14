# AI Tech Reader (Second Brain for Developers)

A digital technical reading assistant and knowledge management platform designed for software engineers. It helps developers understand English articles faster, preserve technical terminology, extract vocabulary and concepts, and build a long-term technical knowledge base.

## 🚀 Purpose & Vision

AI Tech Reader is not just an AI translator—it's a developer second brain. 
It automates:
1. **Ingestion**: Crawling articles, cleaning HTML layout noise, and parsing to Markdown.
2. **Translation**: Translating prose to target languages while conserving specialized English terms (e.g. *Suspense*, *Fiber*, *Hydration*, *AST*) with interactive glossaries.
3. **Knowledge Extraction**: Synthesizing key takeaways, vocabulary words (with IPA pronunciation, definitions, and examples), and technical concepts.
4. **Retrieval (RAG)**: Enabling semantic library search and interactive chat across saved insights using `pgvector`.

---

## 📦 Directory Structure

```text
├── apps/
│   ├── frontend/            # Next.js 19 App Router Web Dashboard
│   │   ├── src/app/         # Routing pages (Landing, Dashboard, Articles Viewer)
│   │   └── src/components/  # React components & Providers
│   │
│   └── backend/             # NestJS Enterprise API Gateway & Workers
│       ├── prisma/          # Schema migrations & database definitions (pgvector)
│       └── src/             # Nest modules (Articles ingestion, RAG Chat session, Auth)
│
├── .github/                 # GitHub specific configurations (workflows, PR templates)
├── .agent/                  # AI Development Guidelines & Workflows
├── docs/                    # Extensive technical documentation
├── scripts/                 # Automation scripts
├── AGENTS.md                # How to leverage AI Agents with this repo
├── DEVELOPMENT.md           # Instructions on local development setup
├── CONTRIBUTING.md          # Branching, commits, and review processes
├── SECURITY.md              # Disclosures and security report policy
├── CHANGELOG.md             # Automated release logs
└── README.md
```

---

## 🛠️ Tech Stack & Standards

- **Runtime**: [Node.js (LTS)](file:///.nvmrc)
- **Package Manager**: [pnpm (v9+)](https://pnpm.io)
- **Language**: TypeScript First
- **Linter**: [ESLint (Flat Config)](file:///eslint.config.js)
- **Formatter**: [Prettier](file:///.prettierrc)
- **Quality Checks**: Automated type checking, testing, and linting on PRs
- **Version Control**: Semantic Versioning & Conventional Commits

---

## 🎯 Quick Start Guide

### 1. Install Workspace Packages
Resolve all dependency trees across both packages:
```bash
pnpm install
```

### 2. Configure Local Settings
Set up the environment variables pointing to your database and OpenAI keys:
```bash
# Copy example
cp .env.example .env
```

### 3. Setup Database & pgvector
Make sure your PostgreSQL instance is running. Run the schema sync command:
```bash
pnpm --filter backend exec prisma db push
```

### 4. Run Development Servers
Launch both applications inside local workspaces:
```bash
# Launches NestJS Backend API at http://localhost:3001
pnpm --filter backend start:dev

# Launches Next.js Web App Dashboard at http://localhost:3000
pnpm --filter frontend dev
```

---

## 🤖 AI-Assisted Development

This repository contains AI instruction directories (`.agent/`) specifying styles, patterns, and workflows. AI assistants (such as Cursor, GitHub Copilot, or Gemini) will automatically discover these configurations to produce highly context-aware code matching this template's patterns.
Read [AGENTS.md](file:///AGENTS.md) to learn how to integrate this into your workflow.

---

## 🛡️ Guidelines and Contributing

Please refer to the following documentation files to align with repository engineering standards:
* [DEVELOPMENT.md](file:///DEVELOPMENT.md) - Project setup, engines, and tools guidelines.
* [CONTRIBUTING.md](file:///CONTRIBUTING.md) - Branch strategy, commits rules, and PR guidelines.
* [SECURITY.md](file:///SECURITY.md) - Vulnerabilities disclosures and security guidelines.
