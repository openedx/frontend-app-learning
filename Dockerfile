# Production Docker image for the Rooman Learning MFE.
#
# Multi-stage build:
#   1. `builder`  — Node 20 + npm to compile the React app via fedx-scripts
#   2. `server`   — Caddy serving the static `dist/` output with SPA fallback
#                   (so client-side routes like /learning/course/.../sequence
#                   work on direct page loads, not just navigation)
#
# PUBLIC_PATH=/learning/ is required so webpack (via fedx-scripts) emits
# script tags as src="/learning/runtime.xxx.js" matching the path prefix
# that Tutor's MFE Caddyfile serves assets under. fedx-scripts reads
# PUBLIC_PATH (not PUBLIC_URL) — see the Tutor MFE Dockerfile template.

# ─── Stage 1: build the React bundle ────────────────────────────────────────
FROM docker.io/node:20-bookworm-slim AS builder

RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        git \
        python3 \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

RUN cat > env.config.jsx <<'EOF'
const config = {
  ...process.env,
  pluginSlots: {},
};
export default config;
EOF

ARG APP_NAME=learning
ENV APP_NAME=${APP_NAME}
ENV NODE_ENV=production
ENV PUBLIC_PATH=/learning/
RUN npm run build

# ─── Stage 2: serve the static bundle ───────────────────────────────────────
FROM docker.io/caddy:2-alpine AS server

COPY --from=builder /app/dist /usr/share/caddy

RUN printf '%s\n' \
    ':8080 {' \
    '  root * /usr/share/caddy' \
    '  encode gzip' \
    '  try_files {path} {path}/index.html /index.html' \
    '  file_server' \
    '}' \
    > /etc/caddy/Caddyfile

EXPOSE 8080

CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
