# TouchAI — deploy anywhere, anytime
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
COPY sdk ./sdk
RUN npm ci
COPY index.html vite.config.js ./
COPY src ./src
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4173
COPY --from=build /app/dist ./dist
COPY scripts/serve.mjs ./scripts/serve.mjs
EXPOSE 4173
CMD ["node", "scripts/serve.mjs", "dist", "4173"]
