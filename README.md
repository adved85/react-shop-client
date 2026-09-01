# React Shop Client

A React (Vite) storefront and admin dashboard for an e-commerce shop — browsing, cart, checkout, and an admin area for managing the store.

Bootstrapped from the [react-vite-app](https://github.com/adved85/react-vite-app) template/setup steps, then built out layer by layer into this shop.

## Architecture

This is **not a monolith** — it's a client-only React SPA. All data (products, categories, orders, auth, ...) is served by a separate backend API:

- Backend: [laravel-shop-api](https://github.com/adved85/laravel-shop-api) (Laravel + Sanctum)
- Communication: REST over Axios, base URL set via `VITE_API_URL` (see `.env.development` / `.env.production`)
- Auth: Sanctum token issued by the API, stored client-side and attached as a `Bearer` header by an Axios interceptor

```
React (Vite) client  →  Axios  →  Laravel API  →  Database
```

Run both repos side by side in development — this client expects the API to be reachable at the URL configured in `VITE_API_URL`.

## Getting started

```sh
docker compose up
```

Stop with:

```sh
docker compose down
```

See [src/documentation/1.create-config.txt](src/documentation/1.create-config.txt) for full first-time setup (installing packages, container shell access, etc.).

## How this was built

The app was built up in layers, each one documented in [src/documentation/](src/documentation/) and mirrored by a corresponding git branch/PR. The layers build on each other, so read the docs in this order:

| # | Layer | Docs | Branch |
|---|-------|------|--------|
| 1 | Project setup — Vite scaffold, Docker, initial packages, git init | [1.create-config.txt](src/documentation/1.create-config.txt) | [R1](https://github.com/adved85/react-shop-client/tree/R1) |
| 2 | Home & Shop pages — routes, react-bootstrap, Sass styles, assets/images | [2.home-shop-ui.txt](src/documentation/2.home-shop-ui.txt) | [R1](https://github.com/adved85/react-shop-client/tree/R1) |
| 3 | Product listing polish — Swiper carousel, SVG icons, `Home` decomposed into common components | *(no write-up yet)* | [R2](https://github.com/adved85/react-shop-client/tree/R2) |
| 4 | Product / Cart / Checkout pages — markup | *(no write-up yet)* | [R3](https://github.com/adved85/react-shop-client/tree/R3) |
| 5 | Backend API integration — Axios client, interceptors, env config, service layer, toast notifications | [3.backend-api-integration.md](src/documentation/3.backend-api-integration.md) | [R4](https://github.com/adved85/react-shop-client/tree/R4) |
| 6 | Admin auth & route protection — `AdminContext`, `RequireAdmin` guard | [4.admin-auth-route-protection.txt](src/documentation/4.admin-auth-route-protection.txt) | [R4-2](https://github.com/adved85/react-shop-client/tree/R4-2) |
| 7 | Admin dashboard navigation & auth hardening — sidebar routing, nested routes, 401 handling, server-side logout | [5.admin-dashboard-navigation-and-auth-hardening.txt](src/documentation/5.admin-dashboard-navigation-and-auth-hardening.txt) | [R5](https://github.com/adved85/react-shop-client/tree/R5) |

Each doc explains the *why* behind that step (bugs it fixed, decisions made), not just the *what* — check them before touching related code.

## Project structure

```
src/
├── api/            ← axios client + per-resource API functions
├── services/        ← business logic layer, called by components
├── config/          ← centralised env access, error code lists
├── components/
│   ├── common/       ← shared storefront components (Header, Footer, Hero, ...)
│   ├── context/      ← React context providers (AdminContext, ThemeContext, guards)
│   ├── admin/         ← admin dashboard pages + content/ sections
│   └── hooks/        ← shared hooks
├── assets/          ← images, Sass styles
└── documentation/    ← build log, one file per layer (see table above)
```
