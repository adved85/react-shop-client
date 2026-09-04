# Publish Docker Image Explanation

```yaml
path: (`.github/workflows/docker-publish.yml`)
```

Unfamiliar with "GHCR", "package", "OCI label", or "semver tag"? See
[`github_actions_and_packages_glossary.md`](github_actions_and_packages_glossary.md).

Think of `docker-publish.yml` as:

> **"When a human decides 'this is version 1.2.3', re-prove everything, then build the image and push it to GHCR."**

```text
git tag v1.2.3 && git push origin v1.2.3
                 ↓
          verify  ── calls ci.yml (lint + test + image check)
                 ↓
          build-and-push
                 ↓
   ghcr.io/adved85/react-shop-client:1.2.3
                                     :1.2
                                     :latest
                 ↓
   shop-infrastructure pins ${FRONTEND_VERSION}
```

---

## 1. Header comment

```yaml
#
# Builds and pushes the client image to GHCR. Deliberately separate from ci.yml
# (fast checks vs. slow image build are different concerns) and triggered by
# version tags rather than every push to main, since shop-infrastructure pins a
# specific ${FRONTEND_VERSION} tag rather than tracking a floating `latest`.
```

The rationale lives at the top of the file so the next reader does not have to reconstruct it: two workflows exist because a 20-second lint and a multi-minute image build have different cadences.

```yaml
name: Publish Docker image
```

---

## 2. Triggers

```yaml
on:
  push:
    tags:
      - "v*.*.*"
  workflow_dispatch:
```

**`push: tags:`** — runs only when a tag matching `v*.*.*` is pushed. `v1.2.3` matches; `v1.2` does not; a push to `main` does not.

Why tags and not every push to main? Because shop-infrastructure pins an exact version:

```yaml
frontend:
  image: ghcr.io/adved85/react-shop-client:${FRONTEND_VERSION}
```

Pinning only means something if versions are deliberate, human-chosen release points. If every merge published, the infra repo would be chasing a moving target.

**`workflow_dispatch:`** — adds a "Run workflow" button in the Actions tab for a manual, unversioned build (which gets a commit-sha tag instead, section 7).

---

## 3. Permissions

```yaml
permissions:
  contents: read
  packages: write
```

Sets what the automatic `GITHUB_TOKEN` may do in this workflow.

`packages: write` is **required** to push to GHCR — repository read access alone is not enough. Declaring permissions explicitly at the workflow level also means the token gets nothing else, whatever the repository default happens to be.

---

## 4. Environment variables

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
```

`github.repository` expands to `adved85/react-shop-client`, so the image name follows the repo automatically — fork it or rename it and nothing here needs editing.

Together they build `ghcr.io/adved85/react-shop-client`.

---

## 5. The `verify` job — the release gate

```yaml
jobs:
  # A tag can point at any commit, so nothing otherwise guarantees a release was
  # tested. Calling ci.yml reuses its exact lint, test and image-verification
  # jobs; the image it builds warms the shared gha layer cache, so the push
  # below reuses those layers rather than rebuilding from scratch.
  verify:
    name: Verify
    uses: ./.github/workflows/ci.yml
```

`uses:` at **job level** (not step level) runs another workflow as a *reusable workflow*. That whole file — `setup`, `lint`, `test`, `docker-build` — runs here as one unit.

Why this matters: **a git tag can point at any commit.** Tag an old, broken commit and nothing else would stop it shipping. This re-proves the exact commit being released.

And because the checks are *called* rather than copied, there is no second set of test steps to fall out of sync.

Two bonuses:

* **Cache warming** — `ci.yml`'s `docker-build` job populates the shared GitHub Actions layer cache, so section 8 reuses those layers instead of rebuilding from scratch.
* **Version handoff** — `ci.yml` exports `node-tag`, consumed in section 8.

---

## 6. The `build-and-push` job

```yaml
  build-and-push:
    name: Build and push image
    needs: verify
    runs-on: ubuntu-latest
```

`needs: verify` — nothing here starts until every job inside `ci.yml` succeeded. One red check anywhere and no image is published.

```yaml
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
```

Fresh runner, so check out again; Buildx for BuildKit features and cache import/export.

### Logging in to GHCR

```yaml
      - name: Log in to GHCR
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
```

`github.actor` is whoever triggered the run; `secrets.GITHUB_TOKEN` is minted automatically for the run — **no personal access token to create, store or rotate**, which is exactly why `permissions: packages: write` had to be declared in section 3.

---

## 7. Guarding the API URL

```yaml
      # The bundle bakes this in at build time, so an unset variable would ship
      # a released image that talks to no API at all — fail before publishing.
      - name: Require VITE_API_URL
        run: |
          if [ -z "${{ vars.VITE_API_URL }}" ]; then
            echo "Repository variable VITE_API_URL is not set (Settings → Secrets and variables → Actions → Variables)."
            exit 1
          fi
```

`[ -z … ]` is "string is empty". An unset repository variable expands to nothing, so this catches both "never created" and "created empty".

This guard exists because the failure it prevents is **silent**. Vite compiles the URL into the JavaScript (see [`react_dockerfile.md`](react_dockerfile.md), section 7); with no value the image builds perfectly, pushes perfectly, deploys perfectly — and every API call in the browser goes nowhere. Better to fail here, loudly.

### Creating the variable

**Settings → Secrets and variables → Actions → Variables → New repository variable**

| Name | Value |
|------|-------|
| `VITE_API_URL` | `https://laravel-shop-api.where/api` |

⚠️ **Do not wrap the value in quotes.** In a `.env` file quotes are syntax and the parser strips them. A GitHub Actions variable is stored **literally**, so `"https://…"` compiles the quote characters *into* the string:

```text
value "https://x/api"  →  apiUrl:`"https://x/api"`  →  requests go to  https://x/api"/admin/login
```

It is a **variable, not a secret**, on purpose: the value ships inside the public JavaScript bundle anyway. Making it a secret would only add false comfort — and secrets are masked in logs, which would make debugging harder for no gain.

---

## 8. Computing the tags

```yaml
      - name: Extract image metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix=,enable=${{ github.event_name == 'workflow_dispatch' }}
```

This action turns the git ref into a list of image tags plus a set of OCI labels. For tag `v1.2.3`:

| Rule | Produces | Role |
|------|----------|------|
| `{{version}}` | `1.2.3` | The exact pin shop-infrastructure uses |
| `{{major}}.{{minor}}` | `1.2` | Moving pointer for patch updates |
| *(automatic)* | `latest` | Newest stable |
| `type=sha` | `a1b2c3d…` | Only on manual runs |

Note the `v` is dropped — image tags are conventionally bare versions.

### Where `latest` comes from

```yaml
          # `latest` is added automatically by the default `latest=auto` flavor,
          # which — unlike a raw always-on latest tag — skips pre-releases, so
          # tagging v2.0.0-rc1 will not move `latest` off the current stable
          # release.
```

Nothing in the `tags:` list mentions `latest`; the action's default `latest=auto` flavor adds it — and crucially **skips pre-releases**. `v2.0.0-rc1` publishes `2.0.0-rc1` and leaves `latest` pointing at the last stable version, so nobody pulling `latest` gets a release candidate by accident.

### The conditional sha tag

```yaml
            type=sha,prefix=,enable=${{ github.event_name == 'workflow_dispatch' }}
```

`enable:` takes an expression — this rule applies only on manual runs, which have no version tag behind them and would otherwise produce no tag at all. `prefix=` empties the default `sha-` prefix.

---

## 9. Build and push

```yaml
      - name: Build and push image
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          build-args: |
            NODE_VERSION=${{ needs.verify.outputs.node-tag }}
            VITE_API_URL=${{ vars.VITE_API_URL }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

The difference from CI's build is `push: true` — and the two build args.

| Key | Meaning |
|-----|---------|
| `tags:` / `labels:` | Consumed from the `meta` step by its `id` |
| `NODE_VERSION` | `needs.verify.outputs.node-tag` — the value `ci.yml` resolved from `.env` |
| `VITE_API_URL` | The repository variable, now known to be non-empty |
| `cache-from: type=gha` | Reuses layers `verify` just built |

`labels:` are OCI annotations (source repo, commit, build time) baked into the image, which is what makes the GHCR package page link back to this repository and commit.

Both tags are pushed in one operation — the layers are uploaded once and the tags are just pointers to the same digest.

---

## 10. Cutting a release

```sh
git checkout main
git pull
git tag v0.1.0
git push origin v0.1.0
```

Then watch Actions: `verify` → `build-and-push`.

⚠️ **First release only — package visibility.** A new GHCR package is **private**. shop-infrastructure will fail to pull it (`denied` / `manifest unknown`) until you either:

* make the package public — Package settings → Change visibility, or
* authenticate the pulling host — `docker login ghcr.io -u <user> -p <PAT>` with a token carrying `read:packages`.

Consuming it:

```yaml
# shop-infrastructure/compose.yml
frontend:
  image: ghcr.io/adved85/react-shop-client:${FRONTEND_VERSION}
```

```sh
# shop-infrastructure/.env
FRONTEND_VERSION=0.1.0
```

Deploying a newer version is a one-line change there plus `docker compose pull && docker compose up -d`.

---

## Summary

| Section | Guarantee |
|---------|-----------|
| Tag trigger | Releases are deliberate, never accidental |
| `verify` | The released commit passed lint, tests and the image check |
| `permissions` | The token can push packages and nothing more |
| `Require VITE_API_URL` | No release ships pointing at no API |
| `metadata-action` | Exact, minor and `latest` tags; pre-releases stay out of `latest` |
| `cache-from: gha` | The publish build reuses layers `verify` already built |
