# Deployment Runbook

This document defines deployment pathways, branch mappings, and continuous delivery (CD) patterns for both Web and Mobile stack projects.

---

## 🔀 Environment Mapping

All projects instantiated from this template must adhere to the following branch-to-environment mappings:

| Git Branch | Target Environment | Trigger Mechanism | Deployment Target |
| ---------- | ------------------ | ----------------- | ----------------- |
| `develop`  | Development (dev)  | Git Push (Auto)   | Dev Server / Sandbox |
| `staging`  | Staging (QA/UAT)   | Git Push (Auto)   | Staging Host / TestFlight / Play Console Internal |
| `main`     | Production (prod)  | Git Tag `v*`      | Live Servers / App Stores |

---

## 🌐 Web Deployments

### 1. Serverless/Static Hosting (Next.js / React)
- **Providers**: Vercel, Netlify, AWS Amplify.
- **Workflow**: Ensure build caching is enabled for node modules and framework caches (`.next/cache`).

### 2. Containerized Hostings (Express / NestJS)
- **Providers**: AWS ECS, Google Cloud Run, Kubernetes.
- **Docker Multi-stage Builds**: Use multi-stage Docker builds to prevent dev dependencies from increasing production image sizes.
  ```dockerfile
  # Stage 1: Build
  FROM node:20-alpine AS builder
  RUN npm i -g pnpm
  WORKDIR /app
  COPY package.json pnpm-lock.yaml ./
  RUN pnpm install --frozen-lockfile
  COPY . .
  RUN pnpm run build

  # Stage 2: Production Run
  FROM node:20-alpine
  WORKDIR /app
  COPY package.json pnpm-lock.yaml ./
  RUN npm i -g pnpm && pnpm install --prod --frozen-lockfile
  COPY --from=builder /app/dist ./dist
  CMD ["node", "dist/main.js"]
  ```

---

## 📱 Mobile Deployments (React Native)

Deploying iOS and Android apps requires specific code signing configurations.

### 1. Expo Application Services (EAS Build)
If the React Native application uses Expo:
* Configure credentials in `eas.json`.
* Trigger builds remotely using GitHub actions.
* Push OTA (Over-The-Air) updates directly to development/staging channels.

### 2. Fastlane (Bare React Native)
If the project utilizes bare React Native:
* Configure iOS Provisioning Profiles and Android Keystore variables as repository secrets.
* Store `Fastfile` configurations under `ios/fastlane` and `android/fastlane`.
* Trigger automated TestFlight uploads on staging merges.
