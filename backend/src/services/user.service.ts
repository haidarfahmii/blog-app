import prisma from "../config/prisma.config";
import { User } from "../generated/prisma/client";
import { ApiError } from "../utils/ApiError";

export const UserService = {
  async getAllUsers() {
    return prisma.user.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) throw new ApiError(404, "User not found");

    return user;
  },

  async updateUser(
    id: string,
    data: Partial<Pick<User, "name" | "email">>,
    currentUserId: string
  ) {
    // memastikan pengguna hanya dapat memperbaharui profile mereka sendiri
    if (id !== currentUserId) {
      throw new ApiError(403, "Unauthorized to update this user");
    }

    // periksa email baru sudah digunakan (kondisi email diubah)
    if (data.email) {
      const existingUser = await prisma.user.findFirst({
        where: {
          email: data.email,
          id: {
            not: id,
          }, // cari email ini di pengguna lain
        },
      });
      if (existingUser) throw new ApiError(409, "Email already in use");
    }

    return prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true,
      },
    });
  },

  async getArticlesByUserId(id: string) {
    // pastikan pengguna ada sebelum mengambil artikel
    const user = await prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
    if (!user) throw new ApiError(404, "User not found");

    return prisma.article.findMany({
      where: {
        authorId: id,
        deletedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  },
};
