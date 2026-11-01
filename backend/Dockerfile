# ==============================================================================
# Smart Uzhavan Backend - Production Dockerfile
# Multi-stage minimal production container
# ==============================================================================

FROM node:20-alpine AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=5000
ENV HOST=0.0.0.0

# Create data directory for persistent ecosystem store
RUN mkdir -p /app/data && chown -R node:node /app

# Copy production node_modules from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --chown=node:node . .

# Run as non-privileged node user for security
USER node

# Expose standard port
EXPOSE 5000

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:${PORT:-5000}/api/health || exit 1

# Start server
CMD ["node", "src/server.js"]
