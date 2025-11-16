import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";

dotenv.config();
const app: Express = express();
app.use(express.json());
const port = process.env.POR || 5000;

app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  res.status(err.statusCode || 500).json({
    message: err.message || "Something went wrong",
  });
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
