# ==============================================================================
# Multi-Stage Dockerfile for Kingsol Monolithic Application
# Stage 1: Build Client Frontend (Website)
# Stage 2: Build Admin Panel Frontend (/admin-secure)
# Stage 3: Production Backend & Static Asset Runner
# ==============================================================================

# --- Stage 1: Build Client ---
FROM node:20-alpine AS client-builder
WORKDIR /app/client

COPY client/package*.json ./
RUN npm install

COPY client/ ./
RUN npm run build

# --- Stage 2: Build Admin Panel ---
FROM node:20-alpine AS admin-builder
WORKDIR /app/admin-panel

COPY admin-panel/package*.json ./
RUN npm install

COPY admin-panel/ ./
RUN npm run build

# --- Stage 3: Production Runner ---
FROM node:20-alpine AS runner
WORKDIR /app/backend

# Install curl for health checks
RUN apk add --no-cache curl

ENV NODE_ENV=production
ENV PORT=3001

# Install backend production dependencies
COPY backend/package*.json ./
RUN npm install --omit=dev

# Copy backend application source
COPY backend/ ./

# Create uploads and logs directories
RUN mkdir -p /app/backend/uploads /app/backend/logs

# Copy compiled frontend distributions into expected monolithic relative paths
# Express resolves:
# path.join(__dirname, '../client/dist') -> /app/client/dist
# path.join(__dirname, '../admin-panel/dist') -> /app/admin-panel/dist
COPY --from=client-builder /app/client/dist /app/client/dist
COPY --from=admin-builder /app/admin-panel/dist /app/admin-panel/dist

# Expose monolithic application port
EXPOSE 3001

# Container healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start unified Express server
CMD ["npm", "start"]
