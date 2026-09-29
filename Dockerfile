FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NEXT_TELEMETRY_DISABLED=1
ENV TURBO_TELEMETRY_DISABLED=1
ENV DO_NOT_TRACK=1
RUN corepack enable pnpm

FROM base AS builder
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app
RUN npm install -g turbo
COPY . .
# Prune para el backend que servirá ambos
RUN turbo prune @manila/vet-api @manila/vet-web --docker

FROM base AS installer
RUN apk update && apk add --no-cache libc6-compat
WORKDIR /app

# First install the dependencies
COPY .gitignore .gitignore
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
RUN pnpm install --frozen-lockfile --ignore-scripts

# Build the project
COPY --from=builder /app/out/full/ .
# Dummy env if needed
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
# Construimos api y web
RUN pnpm turbo run build --filter=@manila/vet-api --filter=@manila/vet-web

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 expressjs
USER expressjs

# Copiar build de la API y node_modules
COPY --from=installer --chown=expressjs:nodejs /app/node_modules ./node_modules
COPY --from=installer --chown=expressjs:nodejs /app/packages ./packages
COPY --from=installer --chown=expressjs:nodejs /app/apps/veterinaria-api ./apps/veterinaria-api
# Copiar build del Frontend
COPY --from=installer --chown=expressjs:nodejs /app/apps/veterinaria-web/dist ./apps/veterinaria-web/dist

ENV NODE_ENV=production
ENV PORT=4000
ENV HOSTNAME="0.0.0.0"

EXPOSE 4000

CMD ["node", "apps/veterinaria-api/dist/server.js"]
