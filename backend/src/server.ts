import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";

import authRouter from "../src/routers/auth.router";
import userRouter from "./routers/user.router";
import articleRouter from "../src/routers/article.router";
import { errorHandler, notFoundHandler } from "./middlewares/error.middleware";

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("FATAL ERROR: DATABASE_URL is not defined.");
  process.exit(1);
}

const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Body parser untuk form data

// CORS configuration (sesuaikan origin jika perlu)
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

// Health check endpoint
app.get("/", (_req: Request, res: Response) => {
  res.json({
    message: "Blog API is running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/articles", articleRouter);

// 404 handler (must be before error hendler)
app.use(notFoundHandler);

// error handler
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});

export default app;
