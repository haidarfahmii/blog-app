import prisma from "../config/prisma.config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../generated/prisma/client";
import { ApiError } from "../utils/ApiError";

export const AuthService = {
  async register({
    name,
    email,
    password,
  }: Pick<User, "name" | "email" | "password">) {
    // check jika user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) throw new ApiError(409, "User already exists");

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        updatedAt: true,
        deletedAt: true,
      },
    });

    // setelah user berhasil dibuat, langsung buat token
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new ApiError(500, "JWT secret not configured");

    const token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
      },
      secret,
      {
        expiresIn: "1h",
      }
    );

    return {
      user: newUser,
      token: token,
    };
  },

  async login({ email, password }: Pick<User, "email" | "password">) {
    // cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // kondisi jika user tidak ditemukan
    if (!user) throw new ApiError(404, "User not found");

    // bandingkan password yang diinput dengan hash di database
    const isValidPassword = await bcrypt.compare(password, user.password);

    // kondisi jika password salah
    if (!isValidPassword) throw new ApiError(401, "Invalid password");

    // kondisi jika password benar, buat web token (JWT)
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error("JWT secret not found");

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      secret,
      {
        expiresIn: "1h",
      }
    );

    return { token };
  },
};
