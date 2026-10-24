# Pamir AI · Frontend

React + Vite single-page app for Pamir AI. It talks to the FastAPI backend in `../backend`.

```bash
npm install
cp .env.example .env     # optional: point VITE_API_BASE_URL at your backend
npm run dev              # http://localhost:5173
npm run build            # production build -> dist/
```

**Deploy (Vercel):** set the project Root Directory to this folder. `vercel.json` handles the build and SPA routing.
Set `VITE_API_BASE_URL` in Vercel if your backend URL differs from the default.

Product catalog, exchange rates, landed cost, viability, suppliers, RFQ, marketing and import guidance all come from the backend.
`src/data/tradeData.ts` is an offline fallback copy of the backend datasets (re-sync it if `backend/Data/*.json` changes).
