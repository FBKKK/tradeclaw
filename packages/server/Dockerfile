FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@8 --activate

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY core/package.json ./packages/core/
COPY server/package.json ./packages/server/

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
