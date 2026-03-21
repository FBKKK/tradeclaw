FROM node:20-alpine

WORKDIR /app

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10 --activate

# Copy all files
COPY . .

# Install dependencies
RUN pnpm install

# Build TypeScript
RUN npx tsc -p packages/core/tsconfig.json
RUN npx tsc -p packages/server/tsconfig.json

# Expose port
EXPOSE 3000

# Start
CMD ["node", "packages/server/dist/index.js"]
