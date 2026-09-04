# React Vite CI Explanation

```yaml
path: (`.github/workflows/ci.yml`)
```

Unfamiliar with "job", "step", "runner", or "action"? See
[`github_actions_and_packages_glossary.md`](github_actions_and_packages_glossary.md).

Think of `ci.yml` as:

> **"Before we merge or release, prove that the code lints, the tests pass, and the image actually serves the app."**

```text
setup  (resolve the Node version from .env)
  │
  ├──► lint          npm ci → npm run lint
  ├──► test          npm ci → npm test
  └──► docker-build  build the image → smoke-test nginx
```

---

## 1. Workflow name

```yaml
name: React Vite CI
```

The name shown in the Actions tab.

---

## 2. Triggers

```yaml
on:
  push:
    branches:
      - main
      - develop

  pull_request:
    branches:
      - main
      - develop

  # Lets docker-publish.yml gate a release on this exact pipeline instead of
  # redefining the checks there, which would let the two drift apart.
  workflow_call:
    outputs:
      node-tag:
        description: Node base image tag resolved from .env
        value: ${{ jobs.setup.outputs.node-tag }}
```

CI runs when:

* code is **pushed** to `main` or `develop`
* a **PR targets** `main` or `develop`
* another workflow **calls** this one

⚠️ Note what is *not* here: pushing branch `L8` itself does not run CI. Only the pull request does, because the branch is not `main`/`develop` but the PR *targets* `main`.

The third trigger is the one that ties the two workflows together:

```text
docker-publish.yml
       ↓
    calls CI
       ↓
 lint + test + image check
       ↓
 if all pass → build/publish image
```

So the release pipeline never re-declares the test steps, and the two can never drift.

### The `outputs` block

```yaml
    outputs:
      node-tag:
        value: ${{ jobs.setup.outputs.node-tag }}
```

A reusable workflow can hand values **back to its caller**. Here CI republishes the Node tag it resolved in section 4, so `docker-publish.yml` can build with the same version without grepping `.env` a second time:

```yaml
# in docker-publish.yml
          build-args: |
            NODE_VERSION=${{ needs.verify.outputs.node-tag }}
            VITE_API_URL=${{ vars.VITE_API_URL }}
```

---

## 3. Concurrency

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

One run at a time per workflow + branch. Push twice in quick succession and the first run is **cancelled**, not queued.

Two benefits: minutes are not burned on a commit nobody cares about any more, and a slow older run cannot report its (stale) result after the newer one.

---

## 4. `setup` job — resolve the Node version

```yaml
jobs:
  setup:
    name: Resolve Node version
    runs-on: ubuntu-latest

    outputs:
      node-tag: ${{ steps.node.outputs.tag }}
      node-version: ${{ steps.node.outputs.version }}
```

This job exists to solve one specific problem: **the Node version is needed in two different shapes.**

| Consumer | Wants | Example |
|----------|-------|---------|
| Docker (`FROM node:…`) | An image tag | `25-alpine` |
| `actions/setup-node` | A Node release | `25` |

`25-alpine` is a Docker Hub tag, *not* a Node version. Handing it to `setup-node` fails — runners are Ubuntu, there is no alpine build to download.

`outputs:` at the job level re-exports two step outputs so the other three jobs can read them.

### Steps

```yaml
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
```

Downloads the repository onto the runner. Every job starts on a fresh machine with an empty disk, so **each job checks out again** — that is why this step repeats in all four.

```yaml
      - name: Read NODE_VERSION from .env
        id: node
        run: |
          tag=$(grep '^NODE_VERSION=' .env | cut -d= -f2 | tr -d '"')
          echo "tag=${tag}" >> "$GITHUB_OUTPUT"
          echo "version=${tag%-*}" >> "$GITHUB_OUTPUT"
```

Line by line:

* `id: node` — names the step so its outputs can be referenced as `steps.node.outputs.*`.
* `grep '^NODE_VERSION='` — finds the line in `.env`. The `^` anchor avoids matching a longer variable that merely ends with the same text.
* `cut -d= -f2` — keeps everything after the first `=` → `"25-alpine"`.
* `tr -d '"'` — strips the quotes → `25-alpine`.
* `>> "$GITHUB_OUTPUT"` — the modern way to publish a step output; appending `name=value` to that file makes it readable elsewhere.
* `${tag%-*}` — shell parameter expansion: remove the shortest suffix matching `-*` → `25`.

Result:

```text
.env: NODE_VERSION="25-alpine"
        ↓
  tag     = 25-alpine   → Docker build arg
  version = 25          → actions/setup-node
```

---

## 5. `lint` job

```yaml
  lint:
    name: Lint code
    needs: setup
    runs-on: ubuntu-latest
```

`needs: setup` does two things: it waits for `setup` to finish, and it makes `needs.setup.outputs.*` available.

```yaml
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ needs.setup.outputs.node-version }}
          cache: npm
```

Installs Node **25** — the bare version resolved in section 4.

`cache: npm` caches the npm download directory between runs, keyed on `package-lock.json`. Unchanged dependencies mean the next run installs from cache.

```yaml
      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint
```

`npm ci` — a clean, lock-file-exact install (see [`react_dockerfile.md`](react_dockerfile.md), section 5).

⚠️ **Known state:** this job currently **fails** — 27 pre-existing ESLint errors in application code that predate this pipeline (unused `React` imports, react-refresh rules, one rules-of-hooks violation). A separate "lint fixes" branch clears them. Red here is expected, not a regression.

---

## 6. `test` job

```yaml
  test:
    name: Run tests
    needs: setup
    runs-on: ubuntu-latest
```

Identical shape to `lint`, ending in:

```yaml
      - name: Run tests
        run: npm test
```

which is `vitest run` — one pass, then exit. Plain `vitest` would start watch mode and hang the runner forever.

The suite itself (Vitest, jsdom, the `tests/` layout) is documented in
[`../6.testing-and-lint.md`](../6.testing-and-lint.md).

`lint` and `test` are **siblings**, not a chain: neither waits for the other, so a lint error never hides a failing test.

---

## 7. `docker-build` job

```yaml
  # Catches Dockerfile and nginx breakage on every push rather than at release
  # time, when docker-publish.yml would otherwise be the first thing to build
  # the image.
  docker-build:
    name: Build Docker image
    needs: setup
    runs-on: ubuntu-latest
```

Without this job, `docker-publish.yml` would be the first thing ever to build the image — so a broken Dockerfile would surface **while cutting a release**. Building on every push moves that failure into the pull request, where it is cheap.

> The API repo does the same and then checks that php-fpm stays in the foreground. The equivalent question for a static site is: *does nginx actually serve the bundle, and does the SPA fallback work?*

### Buildx

```yaml
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
```

Installs BuildKit, which the build action needs for cache export/import and for `RUN --mount=type=cache` in the Dockerfile.

### The build

```yaml
      - name: Build image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: false
          load: true
          tags: react-shop-client:ci
          build-args: NODE_VERSION=${{ needs.setup.outputs.node-tag }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

| Key | Meaning |
|-----|---------|
| `context: .` | Build context is the repo root — `.dockerignore` applies |
| `push: false` | **Verification only.** Nothing leaves the runner |
| `load: true` | Load the result into the local Docker daemon so the next step can `docker run` it |
| `tags:` | A throwaway local name |
| `build-args:` | The `25-alpine` tag from `setup` |
| `cache-from/to: type=gha` | Reuse layers via the GitHub Actions cache; `mode=max` caches intermediate layers too |

⚠️ `load: true` is easy to forget. Without it the image stays inside BuildKit and `docker run … react-shop-client:ci` in the next step fails with "image not found".

⚠️ Note there is **no** `VITE_API_URL` here. This image is built purely to prove it builds and serves, so its bundle carries an empty API URL (`apiUrl:``). Only `docker-publish.yml` passes the real value.

### The smoke test

```yaml
      - name: Verify nginx serves the built bundle and SPA routes
        run: |
          docker run -d --name smoke -p 8080:80 react-shop-client:ci
```

Starts the freshly built image detached, mapping runner port 8080 to container port 80.

```yaml
          for _ in $(seq 1 15); do
            curl -fsS http://localhost:8080/ > /dev/null && break
            sleep 1
          done
```

Waits for nginx to accept connections — up to 15 tries, one second apart, breaking as soon as a request succeeds. A fixed `sleep 5` would be both slower on a good day and flaky on a bad one.

```yaml
          if ! curl -fsS http://localhost:8080/ | grep -q 'id="root"'; then
            docker logs smoke
            docker rm -f smoke
            echo "index.html was not served"
            exit 1
          fi
```

**Check 1 — is the app actually there?** `id="root"` is the mount point React renders into, so finding it proves the built `index.html` is being served rather than nginx's default welcome page.

On failure it prints `docker logs smoke` *before* cleaning up — without that, a CI failure here would tell you nothing about why.

```yaml
          # A deep link must fall through to index.html, otherwise React Router
          # routes 404 on hard reload.
          status=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/admin/dashboard)
          docker rm -f smoke

          if [ "$status" != "200" ]; then
            echo "SPA fallback missing: /admin/dashboard returned ${status}"
            exit 1
          fi
```

**Check 2 — does the SPA fallback work?** `-o /dev/null -w '%{http_code}'` throws away the body and prints only the status code. A `200` means `try_files` handed back `index.html`; a `404` means the fallback is gone and every hard reload of an admin page would break in production.

This is the check that guards the single most fragile line of the nginx config — see [`nginx_default_conf.md`](nginx_default_conf.md), section 5.

```yaml
          echo "nginx serves index.html and falls back for client-side routes."
```

A clear success line in the log, so a green check says *what* was proven.

---

## Summary

| Job | Proves | Currently |
|-----|--------|-----------|
| `setup` | `.env` yields both version shapes | ✅ |
| `lint` | ESLint is clean | ❌ 27 pre-existing errors |
| `test` | 11 Vitest tests pass | ✅ |
| `docker-build` | Image builds, nginx serves, deep links work | ✅ |

Run the equivalent locally before pushing:

```sh
docker compose run --rm frontend sh
npm run lint
npm test
exit

docker build --build-arg NODE_VERSION=25-alpine -t react-shop-client:ci .
docker run -d --name smoke -p 8099:80 react-shop-client:ci
curl -o /dev/null -w '%{http_code}\n' http://localhost:8099/admin/dashboard   # want 200
docker rm -f smoke
```
