FROM mcr.microsoft.com/playwright:v1.50.0-jammy

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --production

COPY tsconfig.json ./
COPY src/ ./src/
RUN npx tsc

EXPOSE 9222

CMD ["node", "dist/worker.js"]
