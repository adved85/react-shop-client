# React Dockerfile Explanation

```yaml
path: (`Dockerfile`)
```

Unfamiliar with "stage", "layer", "build arg", or "build context"? See
[`github_actions_and_packages_glossary.md`](github_actions_and_packages_glossary.md).

Think of the `Dockerfile` as:

> **"Take the source, produce a bundle with Node, then throw Node away and let nginx serve what's left."**

```text
stage 1 "build"            stage 2 "runtime"
┌────────────────────┐     ┌──────────────────────┐
│ node:25-alpine     │     │ nginx:alpine         │
│ npm ci             │     │ default.conf         │
│ npm run build      │ ──► │ /usr/share/nginx/html│
│ → /app/dist        │     │ EXPOSE 80            │
└────────────────────┘     └──────────────────────┘
   discarded entirely        this is the image
```

---

## 1. Syntax directive

```dockerfile
# syntax=docker/dockerfile:1
```

Looks like a comment, but Docker reads it. It pins the **Dockerfile frontend** — the parser — to the version 1 line, which is what enables newer features such as `RUN --mount=type=cache` (section 5).

⚠️ Delete this line and the cache mount becomes a syntax error on older Docker versions.

---

## 2. The Node version argument

```dockerfile
# Keep in sync with .env's NODE_VERSION, which drives docker-compose.yml and CI.
ARG NODE_VERSION=25-alpine
```

An `ARG` **before the first `FROM`** is special: it is the only kind that can be used *in* a `FROM` line.

`25-alpine` is the fallback used when nobody passes anything. CI always passes the real value, read from `.env`:

```sh
docker build --build-arg NODE_VERSION=25-alpine .
```

So the version lives in one place (`.env`) and reaches three consumers: `docker-compose.yml`, this file, and the workflows.

---

## 3. Stage 1 — the build stage

```dockerfile
FROM node:${NODE_VERSION} AS build
```

Starts the first stage from the Node image and **names it `build`**. The name matters — stage 2 copies from it by name in section 10.

```dockerfile
WORKDIR /app
```

Sets the working directory for everything that follows (and creates it). Every later relative path — `./`, `.` — is relative to `/app`.

---

## 4. Copy the manifests first

```dockerfile
# Copied ahead of the source so this layer survives any change that does not
# touch the dependency set.
COPY package.json package-lock.json ./
```

This is **the** caching trick of Node Dockerfiles, and it is worth understanding.

Docker caches per instruction. A layer is reused only if the instruction *and* the files it copies are unchanged. So:

```text
COPY . .          ← if source came first…
RUN npm ci        ← …editing one component invalidates this. Full reinstall. Every time.

COPY package*.json ./   ← manifests only
RUN npm ci              ← reused until a dependency actually changes
COPY . .                ← source changes land here, after the expensive step
```

---

## 5. Install dependencies

```dockerfile
RUN --mount=type=cache,target=/root/.npm npm ci
```

Two separate things here:

**`npm ci`** (not `npm install`) — installs strictly from `package-lock.json`, fails if the lock file disagrees with `package.json`, and wipes `node_modules` first. Reproducible: the same lock file always produces the same tree.

**`--mount=type=cache,target=/root/.npm`** — mounts npm's download cache as a build cache that persists *between builds* but is **not** stored in the image. Even when the layer must rebuild, packages come from local cache instead of the network.

⚠️ `npm ci` installs devDependencies too — that is correct here, because `vite` itself is a devDependency and the build needs it. None of it reaches the final image (section 10).

---

## 6. Copy the source

```dockerfile
COPY . .
```

Copies the build context — everything `.dockerignore` does not exclude. That exclusion list is what keeps `tests/`, `.github/`, `README.md`, `src/documentation` and the `.env*` files out of the image.

⚠️ `.dockerignore` excluding `.env`, `.env.development` and `.env.production` is load-bearing, not tidiness: if a `.env.production` reached this stage, Vite would read it in the next step and it could outrank the build arg below.

---

## 7. The API URL build argument

```dockerfile
# Vite inlines VITE_* values into the bundle at build time, so the API URL is
# fixed for the life of this image rather than read at container start.
# Passed as a build arg (from a repo variable in docker-publish.yml) instead
# of a committed .env.production, so changing it doesn't require a code change.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
```

`ARG` receives the value from `--build-arg`; `ENV` promotes it to a real environment variable so the `npm run build` process below can see it. An `ARG` alone would **not** be visible to the build.

**This is the single most surprising thing about shipping a Vite app in a container.** The value is compiled into the JavaScript as a literal:

```sh
# built with no build arg
$ grep -o 'apiUrl:[^,}]*' assets/index-*.js
apiUrl:``

# built with --build-arg VITE_API_URL="https://laravel-shop-api.where/api"
$ grep -o 'apiUrl:[^,}]*' assets/index-*.js
apiUrl:`https://laravel-shop-api.where/api`
```

Consequences:

* One image = one API URL. Pointing a built image at a different backend means **rebuilding**.
* Setting `VITE_API_URL` in shop-infrastructure's `compose.yml` would do **nothing** — far too late.
* This is why `docker-publish.yml` refuses to publish when the repository variable is empty.

---

## 8. Build the bundle

```dockerfile
RUN npm run build
```

Runs `vite build`, which writes the compiled site to `/app/dist` — hashed JS/CSS in `dist/assets/`, plus `index.html`.

This is the last thing the `build` stage does. Everything it needed — Node, npm, `node_modules`, the source tree — stops here.

---

## 9. Stage 2 — the runtime stage

```dockerfile
FROM nginx:alpine AS runtime
```

A **new, empty** starting point. Nothing from stage 1 carries over automatically — that is exactly the point of a multi-stage build, and why the final image is a small nginx image rather than a Node image with a toolchain inside.

Why nginx at all, when shop-infrastructure already runs one? The edge nginx owns TLS and routing for the whole fleet; this one just serves this app's files on the internal network. The API image can skip a web server because php-fpm speaks FastCGI directly — a folder of static files has no such protocol, so it needs something to answer HTTP.

```dockerfile
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
```

Replaces the stock server block with ours — SPA fallback, gzip, asset caching. Annotated in [`nginx_default_conf.md`](nginx_default_conf.md).

---

## 10. Bring the bundle across

```dockerfile
COPY --from=build /app/dist /usr/share/nginx/html
```

`--from=build` reaches into stage 1 **by name** and copies only `/app/dist`. This one line is what keeps Node out of the shipped image.

`/usr/share/nginx/html` is the document root the config points `root` at.

---

## 11. Port and start command

```dockerfile
EXPOSE 80
```

Documentation, not a firewall rule: it records the port the container listens on. Publishing it is still `-p 8099:80` at `docker run`, or a `ports:` entry in compose.

```dockerfile
CMD ["nginx", "-g", "daemon off;"]
```

`daemon off;` is the important half. By default nginx forks into the background and the foreground process exits — and a container whose main process exits **is a stopped container**. Keeping nginx in the foreground keeps the container alive.

> This is the exact mirror of the API image's concern: its CI verifies php-fpm stays in the foreground for the same reason.

---

## Build it yourself

```sh
# how CI's docker-build job builds it (no API URL — verification only)
docker build --build-arg NODE_VERSION=25-alpine -t react-shop-client:ci .

# how docker-publish.yml builds it (real API URL baked in)
docker build \
    --build-arg NODE_VERSION=25-alpine \
    --build-arg VITE_API_URL="https://laravel-shop-api.where/api" \
    -t react-shop-client:local .

# run it
docker run --rm -p 8099:80 react-shop-client:local

# inspect what shipped
docker run --rm --entrypoint sh react-shop-client:local -c "ls /usr/share/nginx/html"
# → 50x.html  assets  favicon.svg  icons.svg  index.html
```

---

## Summary

| Line | Does | If you remove it |
|------|------|------------------|
| `# syntax=…` | Enables modern Dockerfile features | Cache mount stops parsing |
| `ARG NODE_VERSION` | One Node version for compose + CI + image | Version drifts between dev and prod |
| `COPY package*.json` before source | Keeps `npm ci` cached | Full reinstall on every code edit |
| `RUN --mount=type=cache` | Reuses npm's download cache | Slower rebuilds, more network |
| `ARG`/`ENV VITE_API_URL` | Bakes the API URL into the bundle | Released image talks to no API |
| `FROM nginx:alpine` | Small runtime, no Node | ~10× larger image |
| `COPY --from=build` | Brings only `dist/` across | Source and toolchain ship to production |
| `daemon off;` | Keeps the container alive | Container exits immediately |
