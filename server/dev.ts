import express from "express";
import { createServer } from "http";
import { setupVite } from "./vite";
import { registerRoutes } from "./routes";
import { scheduleCleanup } from "./cleanup";
import { storage } from "./storage";
import { seedDemoJobs } from "./seed-demo-jobs";
import { createServer as createViteServer, createLogger } from "vite";
import viteConfig from "../vite.config";
import fs from "fs";
import path from "path";
import { nanoid } from "nanoid";

const app = express();
const server = createServer(app);

const viteLogger = createLogger();

// Multi-SPA Vite setup: serves both pix.immo (client/) and pixcapture (pixcapture/)
async function setupMultiSpaVite(app: express.Express, server: ReturnType<typeof createServer>) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      // Path-based routing: /pixcapture/* or /pxc/* → pixcapture app
      const isPixcapture = url.startsWith("/pixcapture") || url.startsWith("/pxc");
      
      const templatePath = isPixcapture
        ? path.resolve(import.meta.dirname, "..", "client", "pixcapture", "index.html")
        : path.resolve(import.meta.dirname, "..", "client", "index.html");
      
      // Always reload the index.html file from disk in case it changes
      let template = await fs.promises.readFile(templatePath, "utf-8");
      
      // Add cache-busting to script tag
      if (isPixcapture) {
        template = template.replace(
          'src="/pixcapture/src/main.tsx"',
          `src="/pixcapture/src/main.tsx?v=${nanoid()}"`
        );
      } else {
        template = template.replace(
          'src="/src/main.tsx"',
          `src="/src/main.tsx?v=${nanoid()}"`
        );
      }
      
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

async function startDevServer() {
  const port = process.env.PORT || 5000;

  // Parse JSON body for POST/PUT/PATCH requests
  app.use(express.json());

  // Register Sprint 1 workflow routes BEFORE Hono proxy
  // These routes handle /api/jobs, /api/uploads, etc.
  await registerRoutes(app);

  // Proxy remaining API requests to the Hono server (running in same process)
  // This handles auth routes and other Hono-specific endpoints
  app.use("/api", async (req, res, next) => {
    try {
      // Import the Hono app (it's exported from index.ts in development mode)
      const { default: honoApp } = await import("./index");
      
      // Convert Express req to fetch Request
      // Note: req.url is relative to /api, so prepend /api
      const fullPath = `/api${req.url}`;
      const url = new URL(fullPath, `http://localhost:${port}`);
      
      const headers = new Headers();
      Object.entries(req.headers).forEach(([key, value]) => {
        if (value) headers.set(key, Array.isArray(value) ? value[0] : value);
      });
      
      // Pass client IP for rate limiting
      const clientIP = req.ip || req.socket.remoteAddress || "127.0.0.1";
      headers.set("x-forwarded-for", clientIP);

      // Get raw body for POST/PUT/PATCH
      let body = undefined;
      if (req.method !== "GET" && req.method !== "HEAD" && req.body) {
        body = JSON.stringify(req.body);
        headers.set("Content-Type", "application/json");
      }

      const request = new Request(url.toString(), {
        method: req.method,
        headers,
        body,
      });

      // Call Hono app.fetch()
      const response = await honoApp.fetch(request);
      
      // Convert Response to Express response
      res.status(response.status);
      response.headers.forEach((value, key) => {
        res.setHeader(key, value);
      });
      
      const text = await response.text();
      res.send(text);
    } catch (error) {
      console.error("API proxy error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Setup Multi-SPA Vite middleware (serves both pix.immo and pixcapture)
  await setupMultiSpaVite(app, server);

  // Schedule cleanup job to remove orphaned temp files every 6 hours
  scheduleCleanup(6, 6);

  // Seed demo jobs on startup (only if database is empty)
  await seedDemoJobs(storage);

  server.listen(Number(port), "0.0.0.0", () => {
    console.log(`🚀 Dev server running on http://0.0.0.0:${port}`);
    console.log(`🎨 React app: http://localhost:${port}/`);
    console.log(`📝 Auth sandbox: http://localhost:${port}/public/auth.html`);
    console.log(`💾 Database: PostgreSQL (Neon)`);
    console.log(`⚡ Hot Module Replacement enabled`);
    console.log(`🧹 Temp file cleanup scheduled every 6 hours`);
  });
}

startDevServer().catch((error) => {
  console.error("Failed to start dev server:", error);
  process.exit(1);
});
