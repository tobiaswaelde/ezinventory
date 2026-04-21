FROM node:22-alpine AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /repo

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json tsconfig.json ./
COPY apps/api/package.json apps/api/package.json
COPY packages/eslint-config/package.json packages/eslint-config/package.json

RUN pnpm install --filter @ezinventory/api... --frozen-lockfile

COPY apps/api apps/api
COPY packages/eslint-config packages/eslint-config

WORKDIR /repo/apps/api
RUN pnpm build

WORKDIR /repo
RUN pnpm deploy --filter @ezinventory/api --prod --legacy /out

FROM node:22-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY --from=build /out /app

EXPOSE 3001

CMD ["node", "dist/main.js"]
