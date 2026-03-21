FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy monorepo files
COPY package.json pnpm-lock.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/server/package.json ./packages/server/

# Install dependencies
RUN pnpm install

# Copy source code
COPY . .

# Build packages
RUN pnpm --filter @tradeclaw/core build
RUN pnpm --filter @tradeclaw/server build

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "packages/server/dist/index.js"]
