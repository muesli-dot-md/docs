# syntax=docker/dockerfile:1

# ---- Stage 1: build the static site ----
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies first (better layer caching).
COPY package.json package-lock.json ./
RUN npm ci

# Build the site -> /app/build
COPY . .
RUN npm run build

# ---- Stage 2: serve with nginx ----
# alpine-slim is a much smaller variant (~20MB) that still serves static files
# and supports gzip — everything this site needs.
FROM nginx:1.27-alpine-slim AS runtime

# Custom server config: gzip, long cache for hashed assets, SPA/404 fallback,
# and security headers. Listens on :80 only (Traefik terminates TLS).
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Static output from the build stage.
COPY --from=builder /app/build /usr/share/nginx/html

# The stock nginx image already runs its worker processes as the unprivileged
# "nginx" user (only the master runs as root so it can bind :80). Make the web
# root owned by that user for good measure.
RUN chown -R nginx:nginx /usr/share/nginx/html

EXPOSE 80

# Basic container healthcheck.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
