# ---------- Build stage: install deps + build the React frontend ----------
FROM node:22-bookworm-slim AS build
WORKDIR /app

# Install deps first (better layer caching)
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci

COPY . .
RUN npm run build -w frontend

# ---------- Runtime stage ----------
FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3001

COPY --from=build /app /app
# Tables are created on startup by sequelize.sync().
# Backend serves ../frontend/dist relative to its cwd, so run from /app/backend
WORKDIR /app/backend
EXPOSE 3001
CMD ["node", "index.js"]