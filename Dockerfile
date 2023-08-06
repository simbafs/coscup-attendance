FROM node:20-slim AS base

LABEL org.opencontainers.image.source="https://github.com/simbafs/coscup-attendance"
LABEL org.opencontainers.image.authors="Simba Fs <me@simbafs.cc>"

ENV PNPM_HOME="/pnpm"
ENV NODE_ENV=production
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

FROM base AS build
RUN id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile && pnpm run build
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# RUN pnpm run build

FROM base
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/.next /app/.next

EXPOSE 3000
CMD [ "pnpm", "start"]
