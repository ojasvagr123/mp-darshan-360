# मध्य प्रदेश दर्शन 360

A complete full-stack Interactive Tourism Guide for discovering hidden tourism places of Madhya Pradesh through user-uploaded 360 panorama images, real coordinates, photographs, video guides, historical information, audio narration, comments, and travel experiences.

## Tech Stack

- Frontend: React + Vite + Leaflet/OpenStreetMap
- Computer Graphics: HTML Canvas + requestAnimationFrame
- Backend: Node.js + Express
- Database: Prisma ORM + SQLite locally
- Auth: JWT + bcrypt password hashing
- Uploads: panorama and gallery images stored as database data URLs for easy free deployment
- Audio: browser SpeechSynthesis narrates backend-provided guide scripts
- Video: supports YouTube embed URLs or local/public video-guide URLs
- Deployment-ready: Render backend + Vercel/Netlify frontend + Supabase PostgreSQL

## Local Setup

```bash
cd mp-darshan-360
cp .env.example apps/backend/.env
cp .env.example apps/frontend/.env
npm install
npm run install:all
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:4000/api/health
```

Demo login:

```text
Email: demo@mpdarshan.in
Password: password123
```

## Main Features

- Tourist registration and login
- JWT-protected upload form
- Add place name, district, category, exact latitude/longitude, best time, travel tip, experience, historical information, audio-guide script, video URL, panorama image, and gallery photographs
- Backend validates that coordinates are inside Madhya Pradesh bounds
- Backend calculates map projection values from real latitude/longitude
- Backend renders a complete guide payload with chapters, map data, media, narration, and duration
- Search by title, district, category, and experience text
- Filter by district and category
- Actual Leaflet map using real latitude/longitude markers
- 360-style panorama viewer with drag and zoom
- Photo gallery for every destination
- Video guide tab for every destination
- Historical/digital storytelling timeline with CSS animations
- Computer Graphics Lab tab with Canvas animation, DDA route rasterization, Bezier motion, affine transformations, and coordinate projection
- Hindi/English audio guide playback in the browser
- Practical tourist notes: local food, safety, accessibility, best time, duration
- Comments/travel tips on each place
- Government-style UI with Hindi branding

## Computer Graphics Features for Assignment

Open any destination and click the **CG Lab** tab. It demonstrates subject-related CG concepts inside the tourism application:

| CG concept | Where it is used |
| --- | --- |
| Coordinate projection | Backend converts real latitude/longitude into normalized `mapX` and `mapY` values for MP map space. |
| DDA line drawing | Canvas draws small route pixels from Bhopal tourism hub to the selected place. |
| Bezier curve | The animated tourist guide marker follows a quadratic Bezier path. |
| 2D transformations | The moving marker uses translation, rotation, and scaling every frame. |
| Animation loop | `requestAnimationFrame` continuously redraws the grid, route, points, and moving marker. |
| Raster graphics | Canvas renders pixels, lines, filled shapes, labels, and matrix values directly in the browser. |

Files to show for CG implementation:

```text
apps/backend/src/map.js       -> latitude/longitude projection
apps/backend/src/guide.js     -> backend guide payload with CG metadata
apps/frontend/src/main.jsx    -> Canvas algorithms and animation logic
apps/frontend/src/styles.css  -> responsive CG Lab UI
```

Short viva explanation:

```text
The project is an Interactive Tourism Guide for Madhya Pradesh. Along with 360
panorama viewing and maps, it contains a Computer Graphics Lab. The backend maps
real tourist coordinates into 2D screen coordinates. The frontend then uses Canvas
to rasterize a route using the DDA line algorithm, animate movement using a
quadratic Bezier curve, and apply 2D affine transformations using translate,
rotate, and scale operations. This connects the tourism problem statement with
core computer graphics concepts.
```

## Supabase + Render Deployment Notes

For local development, the Prisma schema uses SQLite:

```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

For Supabase PostgreSQL deployment:

1. Replace `apps/backend/prisma/schema.prisma` with `apps/backend/prisma/schema.postgres.prisma`.
2. Set backend environment variables on Render:

```text
DATABASE_URL=your_supabase_pooler_or_direct_postgres_url
JWT_SECRET=any_long_random_secret
CLIENT_URL=https://your-frontend-url.vercel.app
PORT=4000
```

3. Backend build/start on Render:

```bash
npm install --prefix apps/backend
npm run db:generate --prefix apps/backend
npm run db:push --prefix apps/backend
npm run start --prefix apps/backend
```

4. Frontend on Vercel/Netlify:

```text
Root directory: apps/frontend
Build command: npm run build
Output directory: dist
Environment: VITE_API_URL=https://your-render-backend.onrender.com/api
```

This repo also includes `render.yaml` for the backend service. You can create a
new Render Blueprint from the repository and then set `DATABASE_URL` and
`CLIENT_URL` in the Render dashboard.

## Important Practical Note

This project stores panorama/gallery images as database data URLs to avoid paid storage setup. For a real public platform, move images/videos to Supabase Storage or Cloudinary and store only media URLs in the database.

## Project Structure

```text
mp-darshan-360/
  apps/backend/
    prisma/schema.prisma
    src/server.js
    src/auth.js
    src/guide.js
    src/map.js
    src/validators.js
  apps/frontend/
    src/main.jsx
    src/styles.css
    src/api/client.js
    public/mp-tourism-logo.svg
    public/sample-guide-video.html
```
