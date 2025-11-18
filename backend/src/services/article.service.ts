import prisma from "../config/prisma.config";
import { Article } from "../generated/prisma/client";
import { slugify } from "../utils/slug.util";
import { NotFoundError, ForbiddenError } from "../errors/custom.error";
import {
  notDeletedWhere,
  publishedArticleWhere,
  articleSelectList,
  articleSelectDetail,
  articleSelectEdit,
  authorSelect,
} from "../constants/prisma.selects";

/**
 * Mendefinisikan tipe data yang diharapkan dari client saat 'create'
 * Client tidak boleh mengirim 'slug', 'id', 'authorId', dan lain-lain yang dimana hal tersebut dibuat di server bukan client yang input.
 * Omit -> 'membuang' atau 'menghilangkan' properti tertentu dari sebuah tipe.
 *          akan membuang semua properti yang tidak boleh dikirim oleh klien.
 */

type CreateArticleData = Omit<
  Article,
  "id" | "slug" | "authorId" | "createdAt" | "updatedAt" | "deletedAt"
>;

/**
 * Mendefinisikan tipe data yang diharapkan dari client saat 'update'.
 * membuat semua properti didalam CreateArticleData menjadi optional
 */

type UpdateArticleData = Partial<CreateArticleData>;

/**
 * Helper function untuk generate unique slug
 */
const generateUniqueSlug = async (
  title: string,
  excludeId?: string
): Promise<string> => {
  let slug = slugify(title);

  const whereCondition: any = {
    slug,
    ...notDeletedWhere,
  };

  if (excludeId) {
    whereCondition.id = {
      not: excludeId,
    };
  }

  const existingSlug = await prisma.article.findFirst({
    where: whereCondition,
    select: { id: true },
  });

  // jika slug sudah ada, tambahkan timestamp
  if (existingSlug) {
    slug = `${slug}-${Date.now()}`;
  }

  return slug;
};

/**
 * helper function untuk verify article ownership
 */
const verifyOwnership = async (
  articleId: string,
  authorId: string
): Promise<void> => {
  const article = await prisma.article.findFirst({
    where: {
      id: articleId,
      ...notDeletedWhere,
    },
    select: {
      authorId: true,
    },
  });

  if (!article) throw new NotFoundError("Article not found");
  if (article.authorId !== authorId)
    throw new ForbiddenError("You are not the author of this article");
};

export const ArticleService = {
  // [public] mengambil semua artikel yang sudah di publish
  async getAllPublishedArticles() {
    return prisma.article.findMany({
      where: publishedArticleWhere,
      select: articleSelectList,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * [admin] mengambil semua artikel (draft & published)
   * dioptimalkan untuk halaman "Admin Dashboard" (tidak mengambil content)
   */

  async getAllArticlesForAdmin() {
    return prisma.article.findMany({
      where: notDeletedWhere,
      select: {
        id: true,
        slug: true,
        title: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: authorSelect,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });
  },

  // [publik] mengambil satu artikel spesifik by slug
  async getPublishedArticleBySlug(slug: string) {
    const article = await prisma.article.findFirst({
      where: {
        slug,
        ...publishedArticleWhere,
      },
      select: articleSelectDetail,
    });

    // kondisi jika artikel tidak ditemukan atau tidak ada
    if (!article) throw new NotFoundError("Article not found");

    return article;
  },

  // [admin] mengambil satu artikel by ID untuk form 'edit'
  async getArticleByIdForAdmin(articleId: string) {
    const article = await prisma.article.findFirst({
      where: {
        id: articleId,
        ...notDeletedWhere,
      },
      select: articleSelectEdit,
    });

    // kondisi jika artikel tidak ditemukan atau tidak ada
    if (!article) throw new NotFoundError("Article not found");

    return article;
  },

  /**
   * [AUTHENTICATED] Create new article
   *
   * Features:
   * - Auto-generate unique slug dari title
   * - Support draft mode (published: false)
   */
  // [admin/user] membuat artikel baru
  async createArticle(authorId: string, data: CreateArticleData) {
    // buat unique slug dari title
    const slug = await generateUniqueSlug(data.title);

    // buat artikel
    return prisma.article.create({
      data: {
        ...data,
        slug,
        authorId,
      },
      // kembalikan data yang aman
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        author: {
          select: authorSelect,
        },
      },
    });
  },

  /**
   * [AUTHENTICATED] Update article
   *
   * Security:
   * - Only author can update their article
   * - Auto-regenerate slug if title changes
   *
   * @throws {NotFoundError} jika artikel tidak ditemukan
   * @throws {ForbiddenError} jika bukan pemilik artikel
   * [admin/user] update artikel
   * terdapat verifikasi kepemilikan & handle update slug
   */
  async updateArticle(
    articleId: string,
    authorId: string,
    data: UpdateArticleData
  ) {
    // cek kepemilikan
    await verifyOwnership(articleId, authorId);

    // prepare update data
    const updateData: any = { ...data };

    // handle slug update jika title berubah
    if (data.title) {
      const currentArticle = await prisma.article.findUnique({
        where: { id: articleId },
        select: { title: true },
      });

      // hanya regenerate slug jika title benar berubah
      if (currentArticle && data.title !== currentArticle.title) {
        updateData.slug = await generateUniqueSlug(data.title, articleId);
      }
    }

    // update data
    const updateArticle = await prisma.article.update({
      where: { id: articleId },
      data: updateData,
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        updatedAt: true,
        author: {
          select: authorSelect,
        },
      },
    });

    return updateArticle;
  },

  /**
   * [AUTHENTICATED] Soft delete article
   *
   * Security:
   * - Only author can delete their article
   *
   * @throws {NotFoundError} jika artikel tidak ditemukan
   * @throws {ForbiddenError} jika bukan pemilik artikel
   *
   * [admin/user] soft delete artikel
   */
  async deleteArticle(articleId: string, authorId: string) {
    // cek kepemilikan dan update dalam satu kueri atomik
    await verifyOwnership(articleId, authorId);

    await prisma.article.update({
      where: { id: articleId },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: "Article deleted successfully",
    };
  },

  /**
   * [AUTHENTICATED] Toggle article publish status
   * Utility function untuk publish/unpublish artikel
   *
   * @throws {NotFoundError} jika artikel tidak ditemukan
   * @throws {ForbiddenError} jika bukan pemilik artikel
   */
  async togglePublishStatus(articleId: string, authorId: string) {
    // Verify ownership
    await verifyOwnership(articleId, authorId);

    // Get current status
    const article = await prisma.article.findUnique({
      where: { id: articleId },
      select: { published: true },
    });

    if (!article) {
      throw new NotFoundError("Article not found");
    }

    // Toggle status
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: {
        published: !article.published,
      },
      select: {
        id: true,
        title: true,
        published: true,
      },
    });

    return updatedArticle;
  },

  /**
   * [PUBLIC] Search articles by title or content
   */
  async searchArticles(query: string) {
    return prisma.article.findMany({
      where: {
        ...publishedArticleWhere,
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            author: {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            content: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: articleSelectList,
      orderBy: {
        createdAt: "desc",
      },
      take: 20, // Limit results
    });
  },

  /**
   * [PUBLIC] Get articles by category
   */
  async getArticlesByCategory(category: string) {
    return prisma.article.findMany({
      where: {
        ...publishedArticleWhere,
        category: {
          equals: category,
          mode: "insensitive",
        },
      },
      select: articleSelectList,
      orderBy: {
        createdAt: "desc",
      },
    });
  },
};
