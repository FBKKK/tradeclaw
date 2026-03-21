FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy all monorepo files
COPY package.json pnpm-lock.yaml ./
COPY packages/core/package.json ./packages/core/
COPY packages/server/package.json ./packages/server/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build
RUN pnpm build --filter=@tradeclaw/core --filter=@tradeclaw/server

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "packages/server/dist/index.js"]
