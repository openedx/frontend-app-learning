# Production Docker image for the Rooman Learning MFE.
#
# Multi-stage build:
#   1. `builder`  — Node 20 + npm to compile the React app via fedx-scripts
#   2. `server`   — Caddy serving the static `dist/` output with SPA fallback
#                   (so client-side routes like /learning/course/.../sequence
#                   work on direct page loads, not just navigation)
#
# Tutor injects runtime config (LMS_BASE_URL, STUDIO_BASE_URL, etc.) at
# *container start* via environment variables that the MFE reads at boot
# through `process.env.*`. The MFE doesn't need rebuild-time env vars
# beyond APP_NAME — fedx-scripts handles the rest.
#
# Build context is the repo root. Build with:
#   docker build -t ghcr.io/punithrooman/rooman-frontend-app-learning:latest .

# ─── Stage 1: build the React bundle ────────────────────────────────────────
FROM docker.io/node:20-bookworm-slim AS builder

# fedx-scripts shells out to webpack/babel — needs the OS toolchain for
# native dep compile (e.g. node-sass historically; sharp/imagemin still).
RUN apt-get update && apt-get install -y --no-install-recommends \
        ca-certificates \
        git \
        python3 \
        build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install deps first so the layer caches when only source changes.
# Copy lockfiles BEFORE source so a code edit doesn't bust the npm cache.
COPY package.json package-lock.json ./
COPY patches ./patches
# `--ignore-scripts=false` so the MFE's postinstall (which patches a
# couple of upstream node_modules via `patch-package`) actually runs.
RUN npm ci --no-audit --no-fund

# Now the source.
COPY . .

# The MFE build reads `env.config.jsx` at webpack time. Upstream's
# .gitignore excludes this file (it's meant to be per-deployment local
# config) — generate a minimal one inline here so the build is
# self-contained. Tutor injects the *runtime* config (LMS_BASE_URL etc.)
# via process.env at container start, completely separate from this
# build-time file.
#
# Upstream's `example.env.config.jsx` is NOT a safe fallback — it
# imports an optional `@edx/unit-translation-selector-plugin` package
# that isn't in package.json and breaks the webpack build with a module
# resolution error.
#
# When Rooman adds custom plugin slots (AI tutor sidebar, etc.),
# replace this inline heredoc with a real env.config.jsx checked into
# the fork at a non-gitignored path (e.g. config/env.config.jsx, then
# `COPY config/env.config.jsx ./env.config.jsx` before npm run build).
RUN cat > env.config.jsx <<'EOF'
const config = {
  ...process.env,
  pluginSlots: {},
};
export default config;
EOF

# fedx-scripts is the OpenEdx-blessed webpack wrapper. APP_NAME tells it
# which MFE we're building (the same Dockerfile pattern works for every
# frontend-app-* repo).
ARG APP_NAME=learning
ENV APP_NAME=${APP_NAME}
ENV NODE_ENV=production
RUN npm run build

# ─── Stage 2: serve the static bundle ───────────────────────────────────────
FROM docker.io/caddy:2-alpine AS server

# Copy the built bundle from the builder stage. fedx-scripts emits to `dist/`.
COPY --from=builder /app/dist /usr/share/caddy

# A SPA-aware Caddyfile so deep links work. `try_files` falls back to
# index.html for any path that isn't an actual file, which is what
# React Router needs to handle /learning/course/... routes.
RUN printf '%s\n' \
    ':8080 {' \
    '  root * /usr/share/caddy' \
    '  encode gzip' \
    '  # Tutor MFE plugin generates env.config.js + writes it into this' \
    '  # directory at container start. The runtime config (LMS_BASE_URL etc.)' \
    '  # comes through here, not baked into the static bundle.' \
    '  try_files {path} {path}/index.html /index.html' \
    '  file_server' \
    '}' \
    > /etc/caddy/Caddyfile

EXPOSE 8080

# Caddy 2 default entrypoint already runs the Caddyfile; explicit for clarity.
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
