FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy all files
COPY . .

# Install dependencies (including devDependencies for build)
RUN pnpm install --include=dev

# Build TypeScript
RUN pnpm --filter @tradeclaw/core build
RUN pnpm --filter @tradeclaw/server build

# Remove dev dependencies after build
RUN pnpm prune --prod

# Expose port
EXPOSE 3000

# Start command
CMD ["node", "packages/server/dist/index.js"]
