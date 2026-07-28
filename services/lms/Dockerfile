# Care Indeed LMS backend — Cloud Run container.
# Build context must contain: package.json, src/learning/**, services/lms/**.
FROM node:20-slim
WORKDIR /app

# Deps first (better layer caching). node_modules at /app is an ancestor of
# both src/ and services/, so the adapters resolve @google-cloud/* at runtime.
COPY package.json ./
RUN npm install --no-audit --no-fund --omit=dev

# Source (run directly via tsx — no build step; adapters carry // @ts-nocheck).
COPY src ./src
COPY services ./services

ENV NODE_ENV=production
ENV PORT=8080
EXPOSE 8080
CMD ["npx", "tsx", "services/lms/server.ts"]
