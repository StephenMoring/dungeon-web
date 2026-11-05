# Production image: builds the frontend, then serves it with Caddy, which also gets
# the HTTPS certificate and forwards /api to dungeon-service. See Caddyfile.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Vite bakes these into the bundle at build time.
ARG VITE_DISCORD_CLIENT_ID
ARG VITE_DISCORD_REDIRECT_URI
RUN test -n "$VITE_DISCORD_CLIENT_ID" && test -n "$VITE_DISCORD_REDIRECT_URI" \
    && npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
