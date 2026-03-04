# Frontend Dockerfile for VlowGen Platform (Astro)
FROM node:18-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy workspace root files
COPY pnpm-workspace.yaml ./
COPY package.json ./
COPY pnpm-lock.yaml ./
COPY tsconfig.json ./

# Copy shared package
COPY packages/shared/package.json ./packages/shared/
COPY packages/shared/tsconfig.json ./packages/shared/
COPY packages/shared/src ./packages/shared/src

# Copy frontend package
COPY packages/frontend/package.json ./packages/frontend/
COPY packages/frontend/astro.config.mjs ./packages/frontend/
COPY packages/frontend/tsconfig.json ./packages/frontend/
COPY packages/frontend/tailwind.config.mjs ./packages/frontend/

# Copy environment file
COPY .env ./packages/frontend/.env.production

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build shared package first
RUN pnpm --filter @vlowgen/shared build

# Copy frontend source code
COPY packages/frontend/src ./packages/frontend/src
COPY packages/frontend/public ./packages/frontend/public

# Inject client-side environment variables at build time
ARG PUBLIC_API_URL
ENV PUBLIC_API_URL=$PUBLIC_API_URL
ARG PUBLIC_WAN2_API_KEY
ENV PUBLIC_WAN2_API_KEY=$PUBLIC_WAN2_API_KEY
ARG PUBLIC_OPENROUTER_API_KEY
ENV PUBLIC_OPENROUTER_API_KEY=$PUBLIC_OPENROUTER_API_KEY
ARG PUBLIC_COMPOSIO_API_KEY
ENV PUBLIC_COMPOSIO_API_KEY=$PUBLIC_COMPOSIO_API_KEY
ARG PUBLIC_FINGERPRINT_API_KEY
ENV PUBLIC_FINGERPRINT_API_KEY=$PUBLIC_FINGERPRINT_API_KEY

# Build the Astro application
RUN pnpm --filter @vlowgen/frontend build

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

# Copy frontend package.json
COPY packages/frontend/package.json ./packages/frontend/

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built files from builder stage
COPY --from=builder /app/packages/frontend/dist ./packages/frontend/dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S astro -u 1001

# Change ownership
RUN chown -R astro:nodejs /app
USER astro

# Set working directory to frontend
WORKDIR /app/packages/frontend

# Expose port
EXPOSE 4321

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4321/api/health || exit 1

# Start the Astro server
CMD ["node", "./dist/server/entry.mjs"]