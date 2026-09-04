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
# Passed as a build arg (from a repo variable in docker-publish.yml) instead
# of a committed .env.production, so changing it doesn't require a code change.
ARG VITE_API_URL
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
