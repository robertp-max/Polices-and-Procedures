# syntax=docker/dockerfile:1
#
# Care Indeed HH V2 — COMBINED Cloud Run service (full app from `main`):
#   - Vite SPA build (with the real Register/Login UI)  -> served as static
#   - Express auth API (AWS Cognito + DynamoDB)         -> mounted at /api/auth
# Same origin, so the browser registration flow runs without CORS.
#
# AWS credentials are NOT baked in — they are injected at runtime from Secret
# Manager (scoped, non-root IAM user). Only public VITE_* config is embedded.

# ---- 1) Build stage ----
FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV CI=true
COPY package.json package-lock.json ./
RUN npm ci --include=dev
COPY . .
# Production SPA build. VITE_AUTH_API_BASE_URL=/api/auth (same origin) comes from
# the .env.production in the build context.
RUN npm run build && test -f dist/index.html

# ---- 2) Runtime stage (non-root) ----
FROM node:22-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
# Runtime needs node_modules (incl. tsx to run the TS server), the built SPA,
# the server source, the shared src modules the server imports at runtime (e.g.
# Nolan's canonical module catalog: server/ia/nolan/nolanTutorResponder.ts ->
# src/policy/journey/data/modules.ts), the tsconfig path aliases tsx resolves,
# and the (synthetic) allowlist under config/. Kept in lockstep with the root
# Dockerfile — the dockerfileRuntimeParity test fails the build if they drift.
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/server ./server
COPY --from=build /app/src ./src
COPY --from=build /app/config ./config
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/tsconfig.json ./tsconfig.json
USER node
EXPOSE 8080
CMD ["npx", "--no-install", "tsx", "server/cloudrun.ts"]
