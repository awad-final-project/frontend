# Stage 1: Build stage with latest Node.js
FROM node:22-alpine AS build-stage

WORKDIR /app

# Update Alpine packages to patch known vulnerabilities
RUN apk upgrade --no-cache

# Install pnpm via corepack (built-in, more secure)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy dependency files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with frozen lockfile
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Set the API URL for the build
# Default to localhost for local development
# Override with --build-arg VITE_API_BASE_URL=https://your-domain.com/api in production
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# Build the application
RUN pnpm run build

# Stage 2: Production stage with nginx
FROM nginx:1.27-alpine AS production-stage

# Update Alpine packages to patch known vulnerabilities
RUN apk upgrade --no-cache && \
    apk add --no-cache ca-certificates

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy the built app from the previous stage to nginx public directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Create nginx user if not exists and set permissions
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html

# Use non-root user
USER nginx

# Expose port 80 to the outside world
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
