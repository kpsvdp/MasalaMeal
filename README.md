# MasalaMeal — South Indian Menu & Online Ordering

A lightweight full‑stack web app for a South Indian restaurant, featuring a modern UI, online cart, and order API.

## Tech
- **Frontend:** HTML + Tailwind (CDN) + Vanilla JS
- **Backend:** Node.js + Express
- **Data:** JSON menu file (easy to edit)
- **Deploy:** Any Node host (Render, Railway, Vercel)

## Run locally
```bash
npm install
npm run start
# open http://localhost:8080
```

## API
- `GET /api/menu` — returns menu JSON
- `POST /api/order` — { items:[{id, size?, qty}], customer:{name, phone, address, notes} }
  - Responds with order object and computed totals.

> Note: Orders are stored in memory for demo. Use a real DB (e.g., MongoDB) for production.

## GitHub Pages?
GitHub Pages can't run a Node backend. To host the backend:
- Use a Node host (Render/Railway/Vercel). Then set `API_BASE` in `public/app.js` if you split frontend & backend.
- Or deploy the whole app as a single Node service.

Enjoy! 🍛
