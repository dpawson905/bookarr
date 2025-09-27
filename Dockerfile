# Use Node.js 22.20.0 LTS Alpine for smaller image size
FROM node:22.20.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci --include=dev

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Create data directory for Prisma
RUN mkdir -p data

# Generate Prisma client
RUN npx prisma generate

# Create config directory and initialize database during build
RUN mkdir -p /config && DATABASE_URL="file:/config/bookarr.db" npx prisma db push

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=2665

# Install openssl for secret generation, su-exec for user switching, and sqlite3 for database operations
RUN apk add --no-cache openssl su-exec sqlite

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --ingroup nodejs nextjs

# Copy built application
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
# Copy initialized database to config directory
COPY --from=builder /config/bookarr.db /config/bookarr.db

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Create data directories
RUN mkdir -p /config /books /downloads /tmp/bookarr
RUN chown -R nextjs:nodejs /config /books /downloads /tmp/bookarr
RUN chmod -R 755 /config /books /downloads

# Ensure config directory is writable by nextjs user
RUN chown -R nextjs:nodejs /config
RUN chmod -R 755 /config

# Don't switch to nextjs user yet - entrypoint needs to run as root to fix permissions

EXPOSE 2665

ENV PORT=2665
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:2665/api/health || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "server.js"]
