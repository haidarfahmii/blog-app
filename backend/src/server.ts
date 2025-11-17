import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import authRouter from "../src/routers/auth.router";
import articleRouter from "../src/routers/article.router";

dotenv.config();
const app: Express = express();
app.use(express.json());
const port = process.env.PORT || 5000;

app.use("/api/auth", authRouter);
app.use("/api/articles", articleRouter);

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong",
  });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
