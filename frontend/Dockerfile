FROM node:22 AS build
WORKDIR /app
COPY . .
ARG VITE_API_BASE_URL
ARG VITE_WS_URL
RUN npm install
RUN npm run build

FROM caddy:2-alpine
COPY --from=build /app/dist /usr/share/caddy
COPY Caddyfile /etc/caddy/Caddyfile