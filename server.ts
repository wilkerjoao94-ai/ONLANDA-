import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new Database("onlanda.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS ads (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    price REAL NOT NULL,
    category TEXT NOT NULL,
    description TEXT NOT NULL,
    location TEXT NOT NULL,
    phone TEXT NOT NULL,
    imageUrl TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    userId TEXT NOT NULL
  )
`);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get("/api/ads", (req, res) => {
    const { category, search } = req.query;
    let query = "SELECT * FROM ads";
    const params: any[] = [];

    if (category || search) {
      query += " WHERE";
      const conditions = [];
      if (category) {
        conditions.push(" category = ?");
        params.push(category);
      }
      if (search) {
        conditions.push(" (title LIKE ? OR description LIKE ?)");
        params.push(`%${search}%`, `%${search}%`);
      }
      query += conditions.join(" AND");
    }

    query += " ORDER BY createdAt DESC";
    const ads = db.prepare(query).all(...params);
    res.json(ads);
  });

  app.get("/api/ads/:id", (req, res) => {
    const ad = db.prepare("SELECT * FROM ads WHERE id = ?").get(req.params.id);
    if (!ad) return res.status(404).json({ error: "Ad not found" });
    res.json(ad);
  });

  app.post("/api/ads", (req, res) => {
    const { title, price, category, description, location, phone, imageUrl, userId } = req.body;
    const id = Math.random().toString(36).substring(2, 11);
    const createdAt = Date.now();

    try {
      db.prepare(`
        INSERT INTO ads (id, title, price, category, description, location, phone, imageUrl, createdAt, userId)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(id, title, price, category, description, location, phone, imageUrl, createdAt, userId || 'guest');
      
      const newAd = db.prepare("SELECT * FROM ads WHERE id = ?").get(id);
      res.status(201).json(newAd);
    } catch (error) {
      res.status(500).json({ error: "Failed to create ad" });
    }
  });

  app.delete("/api/ads/:id", (req, res) => {
    db.prepare("DELETE FROM ads WHERE id = ?").run(req.params.id);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
