# syntax=docker/dockerfile:1
#
# Care Indeed Home Health V2 — web tier (Vite SPA) for Google Cloud Run.
#
# Multi-stage:
#   1) build    — install deps from the lockfile and run the production Vite build.
#   2) runtime  — distroless, non-root; serves ./dist via a zero-dependency Node
#                 static server on PORT (default 8080), bound to 0.0.0.0.
#
# No secrets are baked into build args or image layers. Only public VITE_* config
# (embedded by Vite at build time) ever reaches the bundle. See .dockerignore for
# what is excluded from the build context (node_modules, .git, .env*, creds, etc.).

# ---- 1) Build stage ----
FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV CI=true
# NOTE: do NOT set NODE_ENV=production here. The build needs devDependencies
# (typescript, vite, @vitejs/plugin-react, tailwind, ...); production mode would
# make `npm ci` skip them and `tsc`/`vite` would be missing. `vite build` emits a
# production bundle regardless of NODE_ENV.

# Install dependencies first for better layer caching. npm ci == reproducible.
# --include=dev is explicit/defensive so devDependencies install even if an
# ambient NODE_ENV=production is inherited.
COPY package.json package-lock.json ./
RUN npm ci --include=dev

# Copy the rest of the build context (filtered by .dockerignore) and build.
COPY . .
RUN npm run build \
    && test -f dist/index.html

# ---- 2) Runtime stage (distroless, non-root) ----
FROM gcr.io/distroless/nodejs22-debian12:nonroot AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080

# Only the built SPA and the static server reach the runtime image — no source,
# no node_modules, no build tooling.
COPY --from=build /app/dist ./dist
COPY deploy/static-server.mjs ./static-server.mjs

EXPOSE 8080

# The distroless nodejs image's entrypoint is `node`; pass the server script.
CMD ["static-server.mjs"]
