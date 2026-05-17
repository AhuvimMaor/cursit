ARG NODE_VERSION=22

FROM node:${NODE_VERSION}-slim AS base

RUN apt-get update && apt-get install -y --no-install-recommends curl ca-certificates tzdata && rm -rf /var/lib/apt/lists/*
ENV TZ=Asia/Jerusalem
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

COPY package*.json ./
COPY tsconfig*.json ./

FROM base AS builder

WORKDIR /app

COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN npm ci --ignore-scripts --workspaces

COPY shared ./shared
COPY backend ./backend
COPY frontend ./frontend

RUN npx prisma generate --schema=backend/prisma/schema.prisma

ENV NODE_OPTIONS=--max-old-space-size=4096
RUN npm run build --workspace=shared
RUN npm run build --workspace=backend
RUN npm run build --workspace=frontend

FROM base AS production

WORKDIR /app

COPY package*.json ./
COPY shared/package*.json ./shared/
COPY backend/package*.json ./backend/

COPY --from=builder /app/node_modules ./node_modules

COPY --from=builder /app/backend/prisma ./backend/prisma
RUN npx prisma generate --schema=backend/prisma/schema.prisma

COPY --from=builder /app/backend/dist ./backend/dist
COPY --from=builder /app/shared/dist ./shared/dist
COPY --from=builder /app/frontend/dist ./frontend/dist

EXPOSE 8000

CMD ["npm", "start", "--workspace=backend"]
