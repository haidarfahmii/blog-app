import prisma from "../config/prisma.config";
import bcrypt from "bcrypt";
import { User } from "../generated/prisma/client";
import {
  NotFoundError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
} from "../errors/custom.error";
import {
  userSelectSafe,
  notDeletedWhere,
  articleSelectList,
  publishedArticleWhere,
} from "../constants/prisma.selects";

/**
 * Type untuk update user data
 */
type UpdateUserData = {
  name?: string;
  email?: string;
  password?: string;
  currentPassword?: string;
};

export const UserService = {
  async getAllUsers() {
    return prisma.user.findMany({
      where: notDeletedWhere,
      select: {
        ...userSelectSafe,
        _count: {
          select: {
            articles: {
              where: publishedArticleWhere,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Get user by ID
   *
   * @throws {NotFoundError} jika user tidak ditemukan
   */
  async getUserById(id: string) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        ...notDeletedWhere,
      },
      select: {
        ...userSelectSafe,
        _count: {
          select: {
            articles: {
              where: publishedArticleWhere,
            },
          },
        },
      },
    });

    if (!user) throw new NotFoundError("User not found");

    return user;
  },

  /**
   * Update user profile
   *
   * Security:
   * - User hanya bisa update profile sendiri
   * - Jika update password, harus provide currentPassword untuk verifikasi
   * - Email harus unique
   *
   * @throws {ForbiddenError} jika user mencoba update profile orang lain
   * @throws {BadRequestError} jika update password tanpa currentPassword
   * @throws {ConflictError} jika email sudah digunakan
   * @throws {NotFoundError} jika user tidak ditemukan
   */
  async updateUser(id: string, data: UpdateUserData, currentUserId: string) {
    // memastikan pengguna hanya dapat memperbaharui profile mereka sendiri
    if (id !== currentUserId) {
      throw new ForbiddenError("You can only update your own profile");
    }

    // fetch current user data
    const currentUser = await prisma.user.findFirst({
      where: {
        id,
        ...notDeletedWhere,
      },
    });

    if (!currentUser) throw new NotFoundError("User not found");

    // Prepare update data
    const updateData: Partial<User> = {};

    // periksa name baru
    if (data.name !== undefined) {
      updateData.name = data.name;
    }

    // periksa email baru sudah digunakan (kondisi email diubah)
    if (data.email && data.email !== currentUser.email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: {
            not: id,
          },
          ...notDeletedWhere,
        },
        select: {
          id: true,
        },
      });

      if (emailExists) throw new ConflictError("Email already in use");

      updateData.email = data.email;
    }

    // handle password update
    if (data.password) {
      // require current password untuk keamanan
      if (!data.currentPassword) {
        throw new BadRequestError(
          "Current password is required to update password"
        );
      }

      // bandingkan password
      const isValidPassword = await bcrypt.compare(
        data.currentPassword,
        currentUser.password
      );

      if (!isValidPassword)
        throw new BadRequestError("Current password is incorrect");

      // hash password baru
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // update user
    const updateUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: userSelectSafe,
    });

    return updateUser;
  },

  /**
   * Get articles by user ID
   *
   * @throws {NotFoundError} jika user tidak ditemukan
   */
  async getArticlesByUserId(id: string) {
    // pastikan pengguna ada sebelum mengambil artikel
    const user = await prisma.user.findFirst({
      where: {
        id,
        ...notDeletedWhere,
      },
      select: {
        id: true,
      },
    });

    if (!user) throw new NotFoundError("User not found");

    // get artikel
    return prisma.article.findMany({
      where: {
        authorId: id,
        ...publishedArticleWhere, // hanya menampilkan artikel yang published
      },
      select: articleSelectList,
      orderBy: {
        createdAt: "desc",
      },
    });
  },

  /**
   * Soft delete user account
   * User hanya bisa delete account sendiri
   *
   * @throws {ForbiddenError} jika user mencoba delete account orang lain
   * @throws {NotFoundError} jika user tidak ditemukan
   */
  async deleteUser(id: string, currentUserId: string) {
    // memastikan pengguna hanya dapat menghapus akun mereka sendiri
    if (id !== currentUserId) {
      throw new ForbiddenError("You can only delete your own account");
    }

    const user = await prisma.user.findFirst({
      where: {
        id,
        ...notDeletedWhere,
      },
      select: {
        id: true,
      },
    });

    if (!user) throw new NotFoundError("User not found");

    // soft delete user dan semua artikelnya dalam satu transaksi
    await prisma.$transaction([
      // soft delete semua artikel user
      prisma.article.updateMany({
        where: {
          authorId: id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      }),
      // soft delete user
      prisma.user.update({
        where: {
          id,
        },
        data: {
          deletedAt: new Date(),
        },
      }),
    ]);

    return {
      message: "User account deleted successfully",
    };
  },
};
