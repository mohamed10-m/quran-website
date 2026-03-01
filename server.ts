import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { Readable } from "stream";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.get("/api/videos", async (req, res) => {
    const query = req.query.q || "nature";
    const orientation = req.query.orientation || "portrait";
    const apiKey = process.env.PEXELS_API_KEY;
    
    if (!apiKey) {
      return res.status(400).json({ error: "PEXELS_API_KEY is not configured in the environment." });
    }

    try {
      const response = await fetch(`https://api.pexels.com/videos/search?query=${query}&orientation=${orientation}&size=medium&per_page=80`, {
        headers: {
          Authorization: apiKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Pexels API responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      res.json(data);
    } catch (error: any) {
      console.error("Error fetching videos:", error);
      res.status(500).json({ error: "Failed to fetch videos from Pexels." });
    }
  });

  app.get("/api/proxy", async (req, res) => {
    const url = req.query.url as string;
    if (!url) {
      return res.status(400).send("URL is required");
    }

    try {
      const headers: any = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      };
      
      if (req.headers.range) {
        headers['Range'] = req.headers.range;
      }

      const response = await fetch(url, {
        redirect: 'follow',
        headers
      });
      
      if (!response.ok && response.status !== 206) {
        return res.status(response.status).send(`Proxy error: ${response.statusText}`);
      }

      res.status(response.status);

      // Forward headers
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      
      // Add CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*");
      
      // Pipe the response
      if (response.body) {
        // @ts-ignore
        Readable.fromWeb(response.body).pipe(res);
      } else {
        res.end();
      }
    } catch (err) {
      console.error("Proxy error:", err);
      res.status(500).send("Proxy error");
    }
  });

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
