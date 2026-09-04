# Docker Image & Pipelines

Line-by-line explanations of the four files that turn this repository into a published container image.

| File | Explains | Source |
|------|----------|--------|
| [react_dockerfile.md](react_dockerfile.md) | The multi-stage image build | [`Dockerfile`](../../../Dockerfile) |
| [nginx_default_conf.md](nginx_default_conf.md) | How the image serves the bundle | [`docker/nginx/default.conf`](../../../docker/nginx/default.conf) |
| [ci.md](ci.md) | Lint, test and image verification | [`.github/workflows/ci.yml`](../../../.github/workflows/ci.yml) |
| [docker_publish.md](docker_publish.md) | Tag-triggered publishing to GHCR | [`.github/workflows/docker-publish.yml`](../../../.github/workflows/docker-publish.yml) |
| [github_actions_and_packages_glossary.md](github_actions_and_packages_glossary.md) | Every term the four use | — |

## Where to start

New to this layer? Read [`../7.docker-ci-and-releases.md`](../7.docker-ci-and-releases.md) first — it is the **narrative**: why the image carries its own nginx, how a release is cut, what the build-time env trap costs you.

These files are the **reference**: open one beside the source file when you need to know what a particular directive does, or before changing it.

## How the pieces connect

```text
        .env  ──────────────────── NODE_VERSION="25-alpine"
          │
          │  read by
          ▼
   ci.yml : setup job ──── node-tag (25-alpine) ──┐
          │                node-version (25)      │
          │                                       │  build arg
   ┌──────┼───────────┐                           ▼
   ▼      ▼           ▼                     Dockerfile
  lint   test   docker-build ─── builds ──► build stage (node)
                     │                            │ dist/
                     │ smoke test                 ▼
                     └──────────────────►  runtime stage (nginx)
                                                  │ + default.conf
                                                  ▼
   docker-publish.yml : verify (calls ci.yml) → build-and-push → GHCR
                                                  │
                                                  ▼
                     shop-infrastructure: image: ghcr.io/…:${FRONTEND_VERSION}
```

## Keeping these honest

These documents quote the real files. If you change a workflow, the Dockerfile or the nginx config, update its explanation **in the same commit** — a stale explanation is worse than none, because it is believed.
