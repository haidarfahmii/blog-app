import { Request, Response, NextFunction } from "express";
import { ArticleService } from "../services/article.service";
import {
  createArticleValidationSchema,
  updateArticleValidationSchema,
} from "../validations/article.validation";
import { ar } from "zod/v4/locales";

export const ArticleController = {
  /**
   * [GET /articles] mengambil semua artikel yang sudah di publish
   */
  async getPublishedArticles(req: Request, res: Response, next: NextFunction) {
    try {
      // memanggil fungsi service yang spesifik untuk publik
      const articles = await ArticleService.getAllPublishedArticles();
      res.status(200).json({
        data: articles,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * [GET /articles/:slug] mengambil satu artikel by slug
   * endpoint untuk halaman detail artikel
   */
  async getPublishedArticleBySlug(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { slug } = req.params;
      const article = await ArticleService.getPublishedArticleBySlug(slug);

      res.status(200).json({
        data: article,
      });
    } catch (error) {
      next(error);
    }
  },

  // fungsi admin / user yang perlu otentikasi
  /**
   * [POST /articles] membuat artikel baru
   * membutuhkan user yang sudah melakukan login
   */
  async createArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const authorId = req.user?.id;
      if (!authorId) {
        throw new Error("Authentication failed");
      }

      const validatedBody = createArticleValidationSchema.parse(req.body);
      const article = await ArticleService.createArticle(
        authorId,
        validatedBody
      );

      res.status(201).json({
        message: "Article created successfully",
        data: article,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * [PUT /articles/:id] update artikel
   * membutuhkan user yang sudah login dan merupakan pemilik artikel
   */
  async updateArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // ini adalah 'articleId'
      const authorId = req.user?.id;

      if (!authorId) {
        return res.status(401).json({
          message: "Authentication failed",
        });
      }

      const validatedBody = updateArticleValidationSchema.parse(req.body);
      const article = await ArticleService.updateArticle(
        id,
        authorId,
        validatedBody
      );

      res.status(200).json({
        message: "Article updated successfully",
        data: article,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * [DELETE /articles/:id] soft delete artikel
   * membutuhkan user yang login dan merupakan pemilik artikel
   */
  async deleteArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params; // ini adalah 'articleId'
      const authorId = req.user?.id;

      if (!authorId) {
        return res.status(401).json({
          message: "Authentication failed",
        });
      }

      await ArticleService.deleteArticle(id, authorId);

      res.status(200).json({
        message: "Article deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * [GET /admin/articles] Endpoint khusus untuk admin.
   * mengambil semua artikel termasuk draft atau yang belom sempat di published
   */
  async getAdminArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const articles = await ArticleService.getAllArticlesForAdmin();

      res.status(200).json({
        data: articles,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * [GET /admin/articles/:id] Endpoint khusus admin
   * mengambil data artikel termasuk draft untuk form edit
   */
  async getAdminArticleById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const article = await ArticleService.getArticleByIdForAdmin(id);

      res.status(200).json({
        data: article,
      });
    } catch (error) {
      next(error);
    }
  },
};
