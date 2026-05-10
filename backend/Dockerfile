# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src/ ./src/

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

CMD ["node", "src/server.js"]