/**
 * Konstanta untuk prisma select queries
 * menghindari repetisi dan memastikan konsistensi data yang dikembalikan
 */

/**
 * Select untuk User tanpa password (safe untuk response)
 */
export const userSelectSafe = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * Select untuk User dengan minimal info (untuk nested relations)
 */
export const userSelectMinimal = {
  id: true,
  name: true,
} as const;

/**
 * Select untuk Author info (digunakan di artikel)
 */
export const authorSelect = {
  id: true,
  name: true,
} as const;

/**
 * Select untuk Article list (tanpa content penuh)
 */
export const articleSelectList = {
  id: true,
  title: true,
  slug: true,
  imageUrl: true,
  category: true,
  description: true,
  published: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: authorSelect,
  },
} as const;

/**
 * Select untuk Article detail (dengan content penuh)
 */
export const articleSelectDetail = {
  id: true,
  title: true,
  slug: true,
  imageUrl: true,
  category: true,
  description: true,
  content: true,
  published: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: authorSelect,
  },
} as const;

/**
 * Select untuk Article edit form (termasuk authorId)
 */
export const articleSelectEdit = {
  id: true,
  title: true,
  slug: true,
  imageUrl: true,
  category: true,
  description: true,
  content: true,
  published: true,
  authorId: true,
  createdAt: true,
  updatedAt: true,
  author: {
    select: authorSelect,
  },
} as const;

/**
 * Where clause untuk data yang tidak dihapus
 */
export const notDeletedWhere = {
  deletedAt: null,
} as const;

/**
 * Where clause untuk artikel yang published dan tidak dihapus
 */
export const publishedArticleWhere = {
  deletedAt: null,
  published: true,
} as const;
