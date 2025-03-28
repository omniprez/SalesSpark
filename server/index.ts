import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import path from 'path';
import { fileURLToPath } from 'url';
import { type Server } from "http";
import cookieParser from 'cookie-parser';
import session from 'express-session';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// Increase JSON body limit to 5MB to accommodate image uploads
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));
app.use(cookieParser());
// Configure session middleware
app.use(session({
  secret: 'isp-sales-platform-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  name: 'isp_sales_sid', // Custom name instead of default connect.sid
  rolling: true, // Reset cookie expiration on each response
  cookie: { 
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // Prevent client-side JS from reading the cookie
    sameSite: 'lax', // Provides CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    path: '/'
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Log the error but don't throw it
    console.error("Server error:", err);
    res.status(status).json({ message });
    // Don't throw the error, as it will crash the server
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    app.use(express.static(path.resolve(__dirname, "../../dist/public")));
    // Handle client-side routing
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) {
        next();
        return;
      }
      res.sendFile(path.resolve(__dirname, '../../dist/public/index.html'));
    });
  }

  const port = process.env.PORT || 5000;
  const host = '0.0.0.0';

// Use the exact listen format that Replit expects to detect the port
// Add error handling
server.on('error', (error) => {
  log(`Server error: ${error.message}`);
});

// Keep connection alive
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

server.listen(Number(port), host, () => {
  log(`Server running at http://${host}:${port}`);
  log(`The application should be visible in the Replit webview tab`);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  log(`Uncaught Exception: ${error.message}`);
});
})();
