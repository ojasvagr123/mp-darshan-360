# SGSITS Virtual Campus

An interactive campus-tour and computer-graphics project for Shri G. S. Institute of Technology & Science, Indore. Visitors can choose a place from the campus image map or sliding directory, follow an animated route, and explore its panorama and information. Only the college administrator has an account and can publish tour stops.

## Features

- Public spectator experience with no registration or login
- Single role-protected college administrator login
- Admin clicks the campus image to store responsive normalized X/Y coordinates
- Admin uploads a description, history, audio script, 360° panorama, and gallery photos
- Clickable numbered campus markers and searchable slide-out place directory
- Interactive drag/zoom panorama, browser narration, gallery, and visitor information
- Canvas DDA route rasterization from the Main Gate
- Quadratic Bezier route animation and 2D translate/rotate transforms
- SGSITS navy/gold visual system, logo, identity lockup, and responsive layout

## Stack

- React 19 + Vite
- HTML Canvas + `requestAnimationFrame`
- Node.js + Express
- Prisma ORM + SQLite
- JWT + bcrypt

## Run locally

```bash
npm install
npm run install:all
npm run db:generate
npm run db:init
npm run db:seed
npm run dev
```

Open `http://localhost:5173`. The API health endpoint is `http://localhost:4000/api/health`.

### Demo administrator

```text
Email: admin@sgsits.ac.in
Password: admin123
```

Change these local demo credentials and `JWT_SECRET` before deployment.

## Render deployment

The project uses separate database schemas:

- `prisma/schema.prisma` — local SQLite development
- `prisma/schema.postgres.prisma` — Render/PostgreSQL deployment

The included `render.yaml` explicitly selects the PostgreSQL schema, creates the
tables, and idempotently seeds the administrator and initial campus stops. Set
`DATABASE_URL` to the PostgreSQL connection string supplied by Render, not a
`file:` URL. Also set `CLIENT_URL` to the deployed frontend origin.

## Computer graphics viva summary

The campus map is a raster image used as a normalized 2D coordinate space. When the administrator clicks it, the application stores percentages rather than fixed screen pixels, so markers remain aligned across viewport sizes. Canvas uses the DDA algorithm to plot route pixels from the Main Gate to a selected stop. An animated direction marker follows a quadratic Bezier curve, with translation and rotation applied every frame. The panorama adds an interactive image-space transformation through drag and zoom.

## Important files

```text
apps/frontend/src/main.jsx                 interactive map, panorama and Canvas logic
apps/frontend/src/styles.css               SGSITS interface and responsive layout
apps/frontend/public/sgsits-campus-map.png campus raster map
apps/backend/src/server.js                 public API and admin-only publishing
apps/backend/prisma/seed.js                admin and initial campus stops
apps/backend/prisma/init-sqlite.mjs        local SQLite initialization fallback
```
