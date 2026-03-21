FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy all files
COPY . .

# Install all dependencies (including devDependencies for tsx)
RUN pnpm install

# Expose port
EXPOSE 3000

# Run directly with tsx (skip type checking for speed)
CMD ["pnpm", "exec", "tsx", "--no-warnings", "packages/server/src/index.ts"]
