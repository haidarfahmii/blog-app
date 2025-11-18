import express, { Express } from "express";
import dotenv from "dotenv";
import authRouter from "../src/routers/auth.router";
import articleRouter from "../src/routers/article.router";
import { errorHandler } from "./middlewares/errorHandler.middleware";

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
app.use(express.json());
const port = process.env.PORT || 5000;

app.use("/api/auth", authRouter);
app.use("/api/articles", articleRouter);

// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   res.status(err.statusCode || 500).json({
//     message: err.message || "Something went wrong",
//   });
// });
app.use(errorHandler);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
