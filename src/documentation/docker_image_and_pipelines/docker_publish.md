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
        uses: actions/checkout@v7

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v4
```

Fresh runner, so check out again; Buildx for BuildKit features and cache import/export.

### Logging in to GHCR

```yaml
      - name: Log in to GHCR
        uses: docker/login-action@v4
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
```

`github.actor` is whoever triggered the run; `secrets.GITHUB_TOKEN` is minted automatically for the run — **no personal access token to create, store or rotate**, which is exactly why `permissions: packages: write` had to be declared in section 3.

---

## 7. The API URL — deliberately not passed

There is no API URL step in this workflow, and no `VITE_API_URL` in its build args. The value comes from the Dockerfile's default, `ARG VITE_API_URL=/api` (see [`react_dockerfile.md`](react_dockerfile.md), section 7).

That is a conscious choice. `/api` is relative, so the browser resolves it against whatever host served the page, and the same image works on `localhost` and on a real domain. A value that never varies between environments does not belong in environment configuration.

It also means `ci.yml`'s `docker-build` job and this job build **the same bundle**, so what CI verified is what ships.

### History: the repository variable and its guard

Earlier the URL was absolute (`https://laravel-shop-api.where/api`), so it differed per environment and came from a GitHub repository variable:

```yaml
      - name: Require VITE_API_URL
        run: |
          if [ -z "${{ vars.VITE_API_URL }}" ]; then
            echo "Repository variable VITE_API_URL is not set."
            exit 1
          fi
```

The guard existed because the failure it prevented was **silent**. An unset variable expands to an empty string, and an *empty* `--build-arg` overrides a Dockerfile default instead of falling back to it. The image would build, push and deploy fine, and every API call would go nowhere. With nothing passed at all, that failure mode is gone, and so is the guard.

Two lessons from that setup still apply to any GitHub Actions variable:

* **Values are stored literally.** Quotes you type become part of the value. `"https://x/api"` would have compiled to `` apiUrl:`"https://x/api"` `` and sent requests to `https://x/api"/admin/login`.
* **Public means variable, not secret.** Anything shipped in the JavaScript bundle is readable by every visitor, so a secret only adds false comfort and masks the value in logs.

---

## 8. Computing the tags

```yaml
      - name: Extract image metadata
        id: meta
        uses: docker/metadata-action@v6
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
        uses: docker/build-push-action@v7
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          # VITE_API_URL is deliberately not passed: the Dockerfile's /api
          # default is the single source, so this build matches the one
          # ci.yml's docker-build job verified.
          # The IDE may flag `needs.verify.outputs.node-tag` as invalid — a
          # false positive: the extension can't follow a reusable workflow's
          # outputs, which ci.yml declares under on.workflow_call.outputs.
          build-args: NODE_VERSION=${{ needs.verify.outputs.node-tag }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

The difference from CI's build is `push: true`. The build args are identical, which is the point: this pushes the same bundle `ci.yml` just verified.

| Key | Meaning |
|-----|---------|
| `tags:` / `labels:` | Consumed from the `meta` step by its `id` |
| `NODE_VERSION` | `needs.verify.outputs.node-tag` — the value `ci.yml` resolved from `.env`. The IDE's "context access might be invalid" warning here is a false positive: the extension can't see outputs declared in another workflow file |
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
| No `VITE_API_URL` build arg | The released bundle is the one CI verified, `apiUrl` = `/api` |
| `metadata-action` | Exact, minor and `latest` tags; pre-releases stay out of `latest` |
| `cache-from: gha` | The publish build reuses layers `verify` already built |
