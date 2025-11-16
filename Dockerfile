FROM node:18-alpine AS build-stage

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./

RUN pnpm install

COPY . .

# Set the API URL for the build
# Default to localhost for local development
# Override with --build-arg VITE_API_BASE_URL=https://your-domain.com/api in production
ARG VITE_API_BASE_URL=http://localhost:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN pnpm run build

# Stage 2: Serve the Vite app with nginx
FROM nginx:alpine AS production-stage

# Copy the built app from the previous stage to nginx public directory
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
