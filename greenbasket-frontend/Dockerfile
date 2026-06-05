# ---- Build Stage ----
FROM node:20-alpine AS build
WORKDIR /app

# Accept build-time VITE_* variables
ARG VITE_API_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ARG VITE_APP_NAME
ARG VITE_APP_URL

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_APP_NAME=$VITE_APP_NAME
ENV VITE_APP_URL=$VITE_APP_URL

COPY package*.json ./
RUN npm ci && npm cache clean --force
COPY . .
RUN npm run build

# ---- Production Stage ----
FROM nginx:1.26-alpine
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN chown -R appuser:appgroup /usr/share/nginx/html /var/cache/nginx /var/run

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

USER appuser
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
