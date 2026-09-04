# GitHub Actions & Packages Glossary

Terms used across [`ci.md`](ci.md), [`docker_publish.md`](docker_publish.md),
[`react_dockerfile.md`](react_dockerfile.md) and [`nginx_default_conf.md`](nginx_default_conf.md).
Only terms this repository actually uses.

---

## GitHub Actions

**Workflow** — one YAML file in `.github/workflows/`. This repo has two: `ci.yml` and `docker-publish.yml`.

**Trigger (`on:`)** — what starts a workflow. Used here: `push` (to branches or tags), `pull_request`, `workflow_call` (another workflow calls it), `workflow_dispatch` (a manual button in the Actions tab).

**Job** — a named unit of work that gets its **own fresh virtual machine**. Jobs run in parallel unless linked by `needs:`. This is why every job repeats `actions/checkout` — nothing carries over between them.

**Runner** — the temporary machine a job runs on. `runs-on: ubuntu-latest` is a GitHub-hosted Ubuntu VM, destroyed when the job ends.

**Step** — one command or action inside a job, run in order on the same machine.

**Action** — a reusable package of steps, referenced with `uses: owner/name@version` (e.g. `actions/checkout@v4`). Pin the major version; new majors can change behaviour.

**`run:` vs `uses:`** — `run:` executes shell on the runner; `uses:` invokes a prebuilt action.

**`needs:`** — declares job dependencies. `needs: setup` waits for `setup` **and** unlocks `needs.setup.outputs.*`.

**Outputs** — values passed between steps or jobs.

```sh
echo "tag=25-alpine" >> "$GITHUB_OUTPUT"     # step output
```

```yaml
steps.node.outputs.tag           # read a step output, same job
needs.setup.outputs.node-tag     # read a job output, another job
```

**`$GITHUB_OUTPUT`** — a file the runner provides; appending `name=value` to it publishes an output. (Replaces the deprecated `::set-output` syntax.)

**Reusable workflow** — a workflow with a `workflow_call:` trigger, callable from another via `uses: ./.github/workflows/ci.yml` **at job level**. That is how `docker-publish.yml` re-runs the whole CI suite without copying it.

**Concurrency group** — `concurrency:` limits how many runs of a group run at once. With `cancel-in-progress: true`, a new push cancels the running one.

**Context expressions** — `${{ … }}` values GitHub substitutes:

| Expression | Is |
|------------|-----|
| `github.repository` | `adved85/react-shop-client` |
| `github.ref` | The ref that triggered the run |
| `github.actor` | Who triggered it |
| `github.event_name` | `push`, `pull_request`, `workflow_dispatch`… |
| `secrets.GITHUB_TOKEN` | Auto-generated token for this run |
| `vars.VITE_API_URL` | A repository **variable** |

**Secret vs variable** — both live in Settings → Secrets and variables → Actions. Secrets are write-only and masked in logs; variables are readable and shown in plain text. `VITE_API_URL` is a **variable** because it ships inside the public JavaScript bundle anyway.

⚠️ Neither is quoted. The stored value is used literally — quotes you type become part of the value.

**`GITHUB_TOKEN`** — a token minted per run, scoped by the `permissions:` block. `packages: write` is what lets it push to GHCR; no personal access token needed.

**`permissions:`** — the token's allowed scopes. Declaring it explicitly means the job gets exactly those, regardless of repository defaults.

---

## Docker

**Image** — an immutable filesystem plus metadata. **Container** — a running instance of one.

**Layer** — the result of one Dockerfile instruction. Layers are cached and reused when the instruction and its inputs are unchanged; this is why `COPY package.json` comes before `COPY . .`.

**Build context** — the directory sent to the builder (`context: .`). `.dockerignore` decides what is excluded from it.

**Multi-stage build** — several `FROM` blocks in one Dockerfile. Later stages copy only what they need (`COPY --from=build`), so build tools never reach the final image.

**Build arg (`ARG`)** — a build-time variable passed with `--build-arg`. It does **not** exist in the running container. An `ARG` before the first `FROM` is the only one usable in a `FROM` line.

**`ENV`** — an environment variable that exists during the build *and* in the running container. `ENV VITE_API_URL=$VITE_API_URL` promotes the build arg so `npm run build` can see it.

**BuildKit / Buildx** — the modern build engine and its CLI. Required for `RUN --mount=type=cache` and for the GHA layer cache. Installed in CI by `docker/setup-buildx-action`.

**Cache mount** — `RUN --mount=type=cache,target=/root/.npm` keeps npm's download cache between builds without storing it in the image.

**`cache-from` / `cache-to: type=gha`** — export and import layer cache to the GitHub Actions cache, so a later job (or run) reuses layers. `mode=max` caches intermediate layers too, not just the final one.

**`load: true`** — after building, load the image into the runner's Docker daemon so a following step can `docker run` it. Without it the image stays inside BuildKit and is not runnable.

**`EXPOSE`** — documentation of the port a container listens on. Actual publishing is `-p host:container` or compose `ports:`.

**`CMD`** — the default command. It must stay in the **foreground**: when the main process exits, the container stops. Hence `nginx -g "daemon off;"`.

---

## Registry & packages

**Registry** — where images are stored. Here: **GHCR**, `ghcr.io`.

**GHCR (GitHub Container Registry)** — GitHub's registry. Images appear under the repository's **Packages**, authenticated with the same GitHub account.

**Image reference** — `ghcr.io/adved85/react-shop-client:1.2.3` = registry / owner / name : tag.

**Tag** — a movable label on an image. `1.2.3` is expected never to move; `1.2` and `latest` move as new releases land.

**Digest** — the immutable `sha256:…` content hash. Several tags can point at one digest — which is why pushing `1.2.3`, `1.2` and `latest` uploads the layers only once.

**`latest`** — convention, not magic: just a tag. `docker/metadata-action`'s default `latest=auto` moves it only for stable releases, never pre-releases.

**Semver tags** — from `docker/metadata-action`: `{{version}}` → `1.2.3`, `{{major}}.{{minor}}` → `1.2`. The leading `v` of the git tag is dropped.

**OCI labels** — standard metadata baked into the image (source repo, commit, build time). Produced by `metadata-action` and passed as `labels:`; they are what link a GHCR package back to its repository and commit.

**Package visibility** — a new GHCR package is **private**. Pulling from elsewhere needs either public visibility or `docker login ghcr.io` with a PAT carrying `read:packages`.

---

## Node & Vite

**`npm ci` vs `npm install`** — `ci` installs strictly from `package-lock.json`, deletes `node_modules` first, and fails if the lock disagrees with `package.json`. Reproducible; the right choice for CI and image builds.

**devDependencies in a build** — `npm ci` installs them, and it must: `vite` is a devDependency. They stay in the build stage and never reach the runtime image.

**`vitest run` vs `vitest`** — `run` executes once and exits. Bare `vitest` starts watch mode and would hang a CI job forever.

**Vite build-time inlining** — Vite replaces `import.meta.env.VITE_*` with **literal values at build time**. There is no runtime lookup, so an image is bound to the API URL it was built with. This single fact drives the build arg, the repository variable and the guard step in `docker-publish.yml`.

**Fingerprinted assets** — `vite build` writes content-hashed filenames (`index-lDf1NLNW.js`). New content means a new URL, which is what makes a one-year `immutable` cache header safe.

---

## nginx

**`try_files $uri $uri/ /index.html`** — try the literal file, then the directory, then fall back to `index.html`. Without it, refreshing a client-side route like `/admin/dashboard` returns 404.

**`root`** — the directory a URL path is resolved against; here `/usr/share/nginx/html`, where the built bundle is copied.

**`daemon off;`** — keeps nginx in the foreground so the container keeps running.
