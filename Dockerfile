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

# Set cookie auth mode
ARG VITE_USE_COOKIE_AUTH=false
ENV VITE_USE_COOKIE_AUTH=$VITE_USE_COOKIE_AUTH

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

# Create necessary directories and set permissions for nginx user
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    chmod -R 755 /usr/share/nginx/html && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# Use non-root user
USER nginx

# Expose port 80 to the outside world
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
