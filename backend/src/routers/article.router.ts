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

const uuidRegex =
  "[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}";

// GET /api/articles - Get all published articles
router.get("/", ArticleController.getPublishedArticles);

// GET /api/articles/search?q=keyword - Search articles
router.get("/search", ArticleController.searchArticles);

// GET /api/articles/category/:category - Get articles by category
router.get("/category/:category", ArticleController.getArticlesByCategory);

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
  `/admin/:id(${uuidRegex})`,
  authenticateToken,
  requireAdmin,
  ArticleController.getAdminArticleById
);

/**
 * Protected action routes (require authentication)
 */

// POST /api/articles - Create new article
router.post(
  "/",
  authenticateToken,
  validate(createArticleValidationSchema),
  ArticleController.createArticle
);

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

// GET /api/articles/:id (Khusus Owner)
router.get(
  `/:id(${uuidRegex})`,
  authenticateToken,
  ArticleController.getArticleById
);
// PUT /api/articles/:id - Update article
router.put(
  `/:id(${uuidRegex})`,
  authenticateToken,
  validate(updateArticleValidationSchema),
  ArticleController.updateArticle
);
// DELETE /api/articles/:id - Delete article
router.delete(
  `/:id(${uuidRegex})`,
  authenticateToken,
  requireOwnershipOrAdmin(getArticleAuthorId),
  ArticleController.deleteArticle
);
// PATCH /api/articles/:id/publish - Toggle publish status
router.patch(
  `/:id(${uuidRegex})/publish`,
  authenticateToken,
  ArticleController.togglePublishStatus
);

// GET /api/articles/:slug - Get published article by slug
router.get("/:slug", ArticleController.getPublishedArticleBySlug);

export default router;
