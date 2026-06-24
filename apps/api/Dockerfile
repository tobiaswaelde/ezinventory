# syntax=docker/dockerfile:1.7

FROM node:22-bookworm-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apt-get update \
 && apt-get install --yes --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/*

RUN corepack enable

WORKDIR /app

FROM base AS build

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY apps/api/package.json apps/api/package.json
COPY libs/shared/package.json libs/shared/package.json

RUN pnpm fetch --filter @ezinventory/api...

COPY apps/api apps/api
COPY libs/shared libs/shared

RUN pnpm install --frozen-lockfile --offline --filter @ezinventory/api...
RUN pnpm --filter @ezinventory/api exec prisma generate
RUN pnpm --filter @ezinventory/api build
RUN pnpm --filter @ezinventory/api --prod deploy --legacy /prod/api

FROM base AS migrator

ENV NODE_ENV=production

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml /app/tsconfig.base.json ./
COPY --from=build /app/apps/api /app/apps/api
COPY --from=build /app/libs/shared /app/libs/shared

WORKDIR /app/apps/api

CMD ["pnpm", "prisma", "migrate", "deploy"]

FROM node:22-bookworm-slim AS runner

ENV NODE_ENV=production

WORKDIR /app

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nestjs

COPY --from=build /app/apps/api/package.json ./package.json
COPY --from=build /prod/api/node_modules ./node_modules
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/generated ./generated
USER nestjs

EXPOSE 3000

CMD ["node", "dist/main.js"]
