import { Router } from "express";
import { ArticleController } from "../controllers/article.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authenticateToken, ArticleController.createArticle);
router.put("/:id", authenticateToken, ArticleController.updateArticle);
router.delete("/:id", authenticateToken, ArticleController.deleteArticle);

router.get("/", ArticleController.getPublishedArticles);
router.get("/:slug", ArticleController.getPublishedArticleBySlug);

export default router;
