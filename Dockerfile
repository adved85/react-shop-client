# syntax=docker/dockerfile:1

# Keep in sync with .env's NODE_VERSION, which drives docker-compose.yml and CI.
ARG NODE_VERSION=25-alpine

########################################
# build: install dependencies and compile the Vite bundle
########################################
FROM node:${NODE_VERSION} AS build

WORKDIR /app

# Copied ahead of the source so this layer survives any change that does not
# touch the dependency set.
COPY package.json package-lock.json ./

RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

# Vite inlines VITE_* values into the bundle at build time, so the API URL is
# fixed for the life of this image rather than read at container start.
# A relative path keeps that from mattering: the browser resolves /api against
# whatever host served the page, so one image works on every domain — as long
# as the edge proxy (shop-infrastructure/proxy/default.conf) routes /api/ to
# the API. Overridable with --build-arg, but beware: an EMPTY build arg
# replaces this default rather than falling back to it.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

########################################
# runtime: static bundle served by nginx, fronted by a separate proxy service
########################################
FROM nginx:alpine AS runtime

COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
