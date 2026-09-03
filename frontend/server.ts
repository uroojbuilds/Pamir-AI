import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// This server's ONLY job now is to serve the frontend bundle (dev via Vite
// middleware, prod as static files). All /api/* business endpoints
// (catalog, exchange-rates, landed-cost, rfq, business-analysis, etc.) are
// served for real by the separate FastAPI backend in Pamir_AI_Backend/
// (run with `uvicorn main:app --port 8000`), which the frontend calls
// directly via VITE_API_BASE_URL (see src/services/apiClient.ts). This file
// used to also fake those same routes with static/in-memory mock data,
// which meant the UI could silently be showing fake numbers even with the
// real backend running. That mock API surface has been removed.
async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
