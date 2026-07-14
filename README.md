# Engineering Template

A production-grade, highly reusable GitHub Repository Template designed as a baseline configuration for modern JavaScript and TypeScript applications.

## 🚀 Purpose

This repository standardizes and streamlines bootstrapping for multiple JavaScript/TypeScript stacks:
- **React Native** (Mobile application development)
- **React** (Single Page Applications)
- **Next.js** (Full-stack SSR web applications)
- **NestJS** (Enterprise-grade backend APIs)
- **Node.js** & **Express.js** (Microservices and REST APIs)

It is pre-configured with industry-standard tooling, CI/CD pipelines, documentation templates, developer guidelines, and AI agent instructions.

---

## 📦 Directory Structure

```text
├── .github/                 # GitHub specific configurations
│   ├── workflows/           # CI/CD, branch protection, promotion workflows
│   ├── ISSUE_TEMPLATE/      # Structured issue forms (bugs, features)
│   ├── CODEOWNERS           # Reviews assignments
│   ├── dependabot.yml       # Weekly dependency updates schedules
│   └── PULL_REQUEST_TEMPLATE.md
│
├── .agent/                  # AI Development Guidelines & Workflows
│   ├── rules/               # Architecture and coding rules
│   ├── skills/              # Prompts/tasks for debugging, code reviews
│   └── workflows/           # Standard checklists for bug fixes and features
│
├── docs/                    # Extensive technical documentation
│   ├── architecture/        # High-level architecture and system design
│   ├── decisions/           # Architecture Decision Records (ADRs)
│   ├── deployment/          # Guides on deployment patterns (Web & Mobile)
│   └── troubleshooting/     # Runbooks and common issues resolutions
│
├── scripts/                 # Automation scripts (setup, release prep)
│   ├── setup.sh
│   └── release.sh
│
├── .editorconfig            # Editor layout configuration
├── .gitignore               # Multi-framework exclusions
├── .nvmrc                   # Project target Node version
├── .prettierrc              # Custom prettier config
├── eslint.config.js         # ESLint Flat configuration
├── .env.example             # Base configuration environment template
│
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

## 🎯 How to Use This Template

### 1. Instantiate the Repository
Click the **"Use this template"** button at the top of the GitHub page. Select **"Create a new repository"**, set your new repository name, and clone it.

### 2. Run the Setup Script
Run the automated environment setup script to configure local files, git settings, and verify system dependencies:
```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

### 3. Initialize Your Chosen Stack
After instantiating this template, clean up or modify configuration folders depending on the specific stack you are building:
- **NestJS/Express**: Initialize your source files inside `src/`.
- **Next.js/React**: Clean workspace and run your framework setup (`pnpm dlx create-next-app@latest .`).
- **React Native**: Set up your React Native structure (or run `npx react-native@latest init`). Make sure to restore the `.github/` and `.agent/` folders to your root directory.

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
