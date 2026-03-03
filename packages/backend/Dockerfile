# Backend Dockerfile for VlowGen Platform
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy workspace root files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy shared package
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src

# Copy backend package
COPY packages/backend/package.json ./packages/backend/
COPY packages/backend/tsconfig.json ./packages/backend/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared package first
RUN pnpm --filter @vlowgen/shared build

# Copy backend source code
COPY packages/backend/src ./packages/backend/src

# Build TypeScript
RUN pnpm --filter @vlowgen/backend build

# Production stage
FROM node:18-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy workspace root files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./

# Copy shared package (needed at runtime for workspace dependency)
COPY packages/shared/package.json ./packages/shared/
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist

# Copy backend package.json
COPY packages/backend/package.json ./packages/backend/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder stage
COPY --from=builder /app/packages/backend/dist ./packages/backend/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S backend -u 1001

# Change ownership
RUN chown -R backend:nodejs /app
USER backend

# Set working directory to backend
WORKDIR /app/packages/backend

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Start the application
CMD ["node", "dist/index.js"]