import { Request, Response, NextFunction } from "express";
import { ArticleService } from "../services/article.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { UnauthorizedError, BadRequestError } from "../errors/custom.error";

export const ArticleController = {
  /**
   * [GET /articles] mengambil semua artikel yang sudah di publish
   */
  getPublishedArticles: asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      // memanggil fungsi service yang spesifik untuk publik
      const articles = await ArticleService.getAllPublishedArticles();
      res.status(200).json({
        success: true,
        data: articles,
      });
    }
  ),

  /**
   * [GET /articles/:slug] mengambil satu artikel by slug
   * endpoint untuk halaman detail artikel
   */
  getPublishedArticleBySlug: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { slug } = req.params;
      const article = await ArticleService.getPublishedArticleBySlug(slug);

      res.status(200).json({
        success: true,
        data: article,
      });
    }
  ),

  // fungsi admin / user yang perlu otentikasi
  /**
   * [POST /articles] membuat artikel baru
   * membutuhkan user yang sudah melakukan login
   */
  createArticle: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const authorId = req.user?.id;
      if (!authorId) {
        throw new UnauthorizedError("Authentication required");
      }

      // req.body sudah divalidasi oleh middleware
      const article = await ArticleService.createArticle(authorId, req.body);

      res.status(201).json({
        success: true,
        message: "Article created successfully",
        data: article,
      });
    }
  ),

  /**
   * [PUT /articles/:id] update artikel
   * membutuhkan user yang sudah login dan merupakan pemilik artikel
   */
  updateArticle: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params; // ini adalah 'articleId'
      const authorId = req.user?.id;

      if (!authorId) {
        throw new UnauthorizedError("Authentication failed");
      }

      // req.body sudah divalidasi oleh middleware
      const article = await ArticleService.updateArticle(
        id,
        authorId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Article updated successfully",
        data: article,
      });
    }
  ),

  /**
   * [DELETE /articles/:id] soft delete artikel
   * membutuhkan user yang login dan merupakan pemilik artikel
   */
  deleteArticle: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params; // ini adalah 'articleId'
      const authorId = req.user?.id;

      if (!authorId) {
        throw new UnauthorizedError("Authentication failed");
      }

      const result = await ArticleService.deleteArticle(id, authorId);

      res.status(200).json({
        success: true,
        ...result,
      });
    }
  ),

  /**
   * [PATCH /api/articles/:id/publish] Toggle publish status
   */
  togglePublishStatus: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const authorId = req.user?.id;

      if (!authorId) {
        throw new UnauthorizedError("Authentication required");
      }

      const article = await ArticleService.togglePublishStatus(id, authorId);

      res.status(200).json({
        success: true,
        message: `Article ${
          article.published ? "published" : "unpublished"
        } successfully`,
        data: article,
      });
    }
  ),

  /**
   * [GET /admin/articles] Endpoint khusus untuk admin.
   * mengambil semua artikel termasuk draft atau yang belom sempat di published
   */
  getAdminArticles: asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const articles = await ArticleService.getAllArticlesForAdmin();

      res.status(200).json({
        success: true,
        data: articles,
      });
    }
  ),

  /**
   * [GET /admin/articles/:id] Endpoint khusus admin
   * mengambil data artikel termasuk draft untuk form edit
   */
  getAdminArticleById: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const article = await ArticleService.getArticleByIdForAdmin(id);

      res.status(200).json({
        success: true,
        data: article,
      });
    }
  ),

  /**
   * [GET /api/articles/search?q=keyword] Search articles
   */
  searchArticles: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { q } = req.query;

      if (!q || typeof q !== "string") {
        throw new BadRequestError("Search query is required");
      }

      const articles = await ArticleService.searchArticles(q);

      res.status(200).json({
        success: true,
        data: articles,
        count: articles.length,
      });
    }
  ),

  /**
   * [GET /api/articles/category/:category] Get articles by category
   */
  getArticlesByCategory: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { category } = req.params;
      const articles = await ArticleService.getArticlesByCategory(category);

      res.status(200).json({
        success: true,
        data: articles,
        count: articles.length,
      });
    }
  ),
};
