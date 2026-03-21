FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy all files
COPY . .

# Install dependencies
RUN pnpm install

# Expose port
EXPOSE 3000

# Run directly with tsx (no build step needed)
CMD ["pnpm", "exec", "tsx", "packages/server/src/index.ts"]
