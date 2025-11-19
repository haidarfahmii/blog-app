import { Router } from "express";
import { ArticleController } from "../controllers/article.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
  requireAdmin,
  requireOwnershipOrAdmin,
} from "../middlewares/role.middleware";
import prisma from "../config/prisma.config";
import { validate } from "../middlewares/validate.middleware";
import {
  createArticleValidationSchema,
  updateArticleValidationSchema,
} from "../validations/article.validation";

const router = Router();

/**
 * Public routes
 */
// GET /api/articles - Get all published articles
router.get("/", ArticleController.getPublishedArticles);
// GET /api/articles/search?q=keyword - Search articles
router.get("/search", ArticleController.searchArticles);
// GET /api/articles/category/:category - Get articles by category
router.get("/category/:category", ArticleController.getArticlesByCategory);
// GET /api/articles/:slug - Get published article by slug
router.get("/:slug", ArticleController.getPublishedArticleBySlug);

/**
 * Helper function untuk middleware requireOwnershipOrAdmin
 * Mengambil authorId dari database berdasarkan articleId di params
 */
const getArticleAuthorId = async (req: any) => {
  const { id } = req.params;
  const article = await prisma.article.findUnique({
    where: { id },
    select: { authorId: true },
  });
  return article?.authorId;
};

/**
 * Protected routes (require authentication)
 */

// POST /api/articles - Create new article
router.post(
  "/",
  authenticateToken,
  validate(createArticleValidationSchema),
  ArticleController.createArticle
);
// PUT /api/articles/:id - Update article
router.put(
  "/:id",
  authenticateToken,
  validate(updateArticleValidationSchema),
  ArticleController.updateArticle
);
// DELETE /api/articles/:id - Delete article
router.delete(
  "/:id",
  authenticateToken,
  requireOwnershipOrAdmin(getArticleAuthorId),
  ArticleController.deleteArticle
);
// PATCH /api/articles/:id/publish - Toggle publish status
router.patch(
  "/:id/publish",
  authenticateToken,
  ArticleController.togglePublishStatus
);
/**
 * Admin routes (require ADMIN role)
 */
// GET /api/articles/admin/all - Get all articles (including drafts)
router.get(
  "/admin/all",
  authenticateToken,
  requireAdmin,
  ArticleController.getAdminArticles
);

// GET /api/articles/admin/:id - Get article by ID for admin
router.get(
  "/admin/:id",
  authenticateToken,
  requireAdmin,
  ArticleController.getAdminArticleById
);

export default router;
