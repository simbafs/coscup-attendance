FROM node:18-alpine

RUN npm i -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . /app
RUN pnpm build

EXPOSE 3000
CMD ["pnpm", "start", "-p", "3000"]
