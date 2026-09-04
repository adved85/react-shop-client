# nginx Config Explanation

```yaml
path: (`docker/nginx/default.conf`)
```

Copied into the image at `/etc/nginx/conf.d/default.conf` — see
[`react_dockerfile.md`](react_dockerfile.md), section 9.

Think of this file as:

> **"Serve the built files, cache the hashed ones forever, and never 404 a React Router path."**

This is the only web server config in this repo. It is **not** the edge nginx from shop-infrastructure — that one owns TLS, port 443 and fleet-wide routing. This one listens on plain HTTP inside the Docker network and serves one app's files.

---

## 1. The server block

```nginx
server {
    listen 80;
    server_name _;
```

`listen 80` — plain HTTP. No certificates here on purpose; the edge proxy terminates HTTPS and forwards to this container over the internal network.

`server_name _;` — `_` is a catch-all that matches any `Host` header. The container serves exactly one site, so there is nothing to distinguish.

---

## 2. Document root

```nginx
    root /usr/share/nginx/html;
    index index.html;
```

`root` is where `COPY --from=build /app/dist` put the compiled site. A request for `/assets/index-abc123.js` is looked up at `/usr/share/nginx/html/assets/index-abc123.js`.

`index index.html` — a request for a directory serves `index.html` from it.

---

## 3. Compression

```nginx
    gzip on;
    gzip_min_length 1024;
    gzip_types text/css text/javascript application/javascript application/json image/svg+xml;
```

`gzip on` alone only compresses `text/html`; `gzip_types` adds the types that actually dominate a React bundle. The JS bundle in this project compresses from ~518 kB to ~169 kB.

`gzip_min_length 1024` skips tiny files, where the CPU cost and the added headers outweigh the saving.

Verify it:

```sh
curl -s -H 'Accept-Encoding: gzip' -D - -o /dev/null \
    http://localhost:8099/assets/index-lDf1NLNW.js | grep -i content-encoding
# → content-encoding: gzip
```

---

## 4. Immutable asset caching

```nginx
    # Vite fingerprints these filenames, so a stale copy can never be served
    # for changed content.
    location /assets/ {
        add_header Cache-Control "public, immutable, max-age=31536000";
    }
```

A year (`31536000` seconds) sounds reckless until you look at the filenames Vite produces:

```text
assets/index-lDf1NLNW.js
assets/index-BG6POG-M.css
```

The hash is derived from the contents. **Change the code and the URL changes.** A browser can therefore never be stuck with a stale copy — a stale URL is simply never requested again. `immutable` goes further and tells the browser not to even send a revalidation request on reload.

`index.html` is deliberately **not** under `/assets/`, so it stays uncached — it is the file that points at the current hashes, and it must always be fresh.

⚠️ Note there is no `try_files` inside this block. That is intentional: a genuinely missing asset returns a real 404 instead of falling through to section 5 and serving HTML with a `.js` URL, which would produce a baffling "Unexpected token '<'" in the console.

---

## 5. The SPA fallback

```nginx
    # Unknown paths belong to React Router, not to nginx — hand them index.html
    # instead of a 404 so deep links like /admin/dashboard work on hard reload.
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**The single most important line in this file.**

React Router resolves `/admin/dashboard` in the browser, client-side. But on a hard reload — or when someone pastes the link — the *browser asks the server* for that path, and no such file exists on disk:

```text
without try_files          with try_files
─────────────────          ──────────────
GET /admin/dashboard       GET /admin/dashboard
  → no such file             → no such file
  → 404                      → no such directory
  → app looks broken         → serve /index.html
                             → React boots, router reads the URL
                             → dashboard renders
```

`try_files` is evaluated left to right: the literal file, then a directory, then the fallback.

⚠️ Deleting this line breaks nothing that a normal click-through would reveal — the app only fails on refresh and shared links. That is precisely why CI has an automated check for it (see [`ci.md`](ci.md), section 7).

---

## Verify the whole file

```sh
docker run -d --name smoke -p 8099:80 react-shop-client:local

curl -fsS http://localhost:8099/ | grep 'id="root"'                        # index.html
curl -o /dev/null -w '%{http_code}\n' http://localhost:8099/admin/dashboard   # 200 ← fallback
curl -o /dev/null -w '%{http_code}\n' http://localhost:8099/assets/nope.js    # 404 ← correct
curl -s -D - -o /dev/null http://localhost:8099/assets/index-*.js | grep -i cache-control
# → Cache-Control: public, immutable, max-age=31536000

docker rm -f smoke
```

---

## Summary

| Directive | Purpose |
|-----------|---------|
| `listen 80` | Plain HTTP; TLS is the edge proxy's job |
| `root` | Where the built bundle lives in the image |
| `gzip_types` | Compress JS/CSS/JSON/SVG, not just HTML |
| `location /assets/` + `immutable` | Cache fingerprinted files for a year |
| `try_files … /index.html` | Deep links and hard reloads work |
