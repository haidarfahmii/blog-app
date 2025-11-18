import { Router } from "express";
import { ArticleController } from "../controllers/article.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createArticleValidationSchema,
  updateArticleValidationSchema,
} from "../validations/article.validation";

const router = Router();

router.post(
  "/",
  authenticateToken,
  validate(createArticleValidationSchema),
  ArticleController.createArticle
);
router.put(
  "/:id",
  authenticateToken,
  validate(updateArticleValidationSchema),
  ArticleController.updateArticle
);
router.delete("/:id", authenticateToken, ArticleController.deleteArticle);

router.get("/", ArticleController.getPublishedArticles);
router.get("/:slug", ArticleController.getPublishedArticleBySlug);

export default router;
