###############################################
# Install dependencies
###############################################
FROM node:lts-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat

ARG NUXT_UI_PRO_LICENSE
ENV NUXT_UI_PRO_LICENSE=$NUXT_UI_PRO_LICENSE

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile


###############################################
# Build the project
###############################################
FROM base AS builder

ARG NUXT_UI_PRO_LICENSE
ENV NUXT_UI_PRO_LICENSE=$NUXT_UI_PRO_LICENSE

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN yarn run build

###############################################
# Run the project
###############################################
FROM base AS runner
ARG NUXT_UI_PRO_LICENSE
ENV NUXT_UI_PRO_LICENSE=$NUXT_UI_PRO_LICENSE

WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nitro
COPY --from=builder /app/.output ./.output
USER nitro

EXPOSE 3000
ENV PORT=3000

CMD ["node", ".output/server/index.mjs"]