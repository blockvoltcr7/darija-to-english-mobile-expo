FROM node:22-slim

ENV NODE_ENV=production
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --legacy-peer-deps

COPY server ./server
COPY trigger ./trigger

EXPOSE 8080

CMD ["npm", "run", "api"]
