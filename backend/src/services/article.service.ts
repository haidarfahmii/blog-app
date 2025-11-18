import prisma from "../config/prisma.config";
import { Article } from "../generated/prisma/client";
import { slugify } from "../utils/slug.util";
import { ApiError } from "../utils/ApiError";

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
 * konstanta untuk 'select' data author yang AMAN.
 * digunakan berulang kali untuk menghindari kebocoran data sensitif (seperti 'email').
 */

const secureAuthorSelect = {
  id: true,
  name: true,
};

export const ArticleService = {
  // [public] mengambil semua artikel yang sudah di publish
  async getAllPublishedArticles() {
    return prisma.article.findMany({
      where: {
        deletedAt: null,
        published: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        category: true,
        description: true,
        createdAt: true,
        author: {
          select: secureAuthorSelect,
        },
      },
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
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: secureAuthorSelect,
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
        published: true,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        category: true,
        description: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: secureAuthorSelect,
        },
      },
    });

    // kondisi jika artikel tidak ditemukan atau tidak ada
    if (!article) throw new ApiError(404, "Article not found");

    return article;
  },

  // [admin] mengambil satu artikel by ID untuk form 'edit'
  async getArticleByIdForAdmin(articleId: string) {
    const article = await prisma.article.findFirst({
      where: {
        id: articleId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        imageUrl: true,
        category: true,
        description: true,
        content: true,
        published: true,
        authorId: true,
        author: {
          select: secureAuthorSelect,
        },
      },
    });

    // kondisi jika artikel tidak ditemukan atau tidak ada
    if (!article) throw new ApiError(404, "Article not found");

    return article;
  },

  // [admin/user] membuat artikel baru
  async createArticle(authorId: string, data: CreateArticleData) {
    // buat slug dari title
    let slug = slugify(data.title);

    // cek unique slug
    const existingSlug = await prisma.article.findFirst({
      where: {
        slug,
        deletedAt: null,
      },
    });

    if (existingSlug) {
      slug = `${slug}-${Date.now()}`; // tambahkan date agar unik
    }

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
          select: secureAuthorSelect,
        },
      },
    });
  },

  /**
   * [admin/user] update artikel
   * terdapat verifikasi kepemilikan & handle update slug
   */
  async updateArticle(
    articleId: string,
    authorId: string,
    data: UpdateArticleData
  ) {
    // cek kepemilikan
    const article = await prisma.article.findFirst({
      where: {
        id: articleId,
        deletedAt: null,
      },
      select: {
        // hanya ambil data yang perlu di cek
        authorId: true,
        title: true,
      },
    });

    if (!article) throw new ApiError(404, "Article not found");
    if (article.authorId !== authorId)
      throw new ApiError(
        403,
        "Unauthorized: You are not the author of this article."
      );

    // handle update slug
    let slugData = {};
    if (data.title && data.title !== article.title) {
      let newSlug = slugify(data.title);
      const existingSlug = await prisma.article.findFirst({
        where: {
          slug: newSlug,
          deletedAt: null,
          id: {
            not: articleId, // cek slug dari artikel lain nya
          },
        },
      });

      if (existingSlug) {
        newSlug = `${newSlug}-${Date.now()}`;
      }
      slugData = { slug: newSlug };
    }

    // update data
    return prisma.article.update({
      where: {
        id: articleId,
      },
      data: {
        ...data,
        ...slugData, // gabungan data baru dan slug baru
      },
      // kembalikan data yang sudah di update
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        updatedAt: true,
        author: {
          select: secureAuthorSelect,
        },
      },
    });
  },

  /**
   * [admin/user] soft delete artikel
   */
  async deleteArticle(articleId: string, authorId: string) {
    // cek kepemilikan dan update dalam satu kueri atomik
    const result = await prisma.article.updateMany({
      where: {
        id: articleId,
        authorId: authorId, // Pastikan hanya author yang bisa menghapus
        deletedAt: null, // Pastikan belum dihapus
      },
      data: {
        deletedAt: new Date(),
      },
    });
    // Jika result.count adalah 0, berarti artikel tidak ditemukan
    // ATAU pengguna bukan pemiliknya.
    if (result.count === 0) {
      throw new ApiError(
        404,
        "Article not found or you are not authorized to delete it."
      );
    }

    return {
      message: "Article deleted successfully",
    };
  },
};
