import prisma from "../config/prisma.config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Role, User } from "../generated/prisma/client";
import {
  ConflictError,
  UnauthorizedError,
  InternalServerError,
} from "../errors/custom.error";
import { notDeletedWhere, userSelectSafe } from "../constants/prisma.selects";

/**
 * Konstanta untuk configuration
 */
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = "24h";

/**
 * Helper function untuk generate JWT token
 */
const generateToken = (userId: string, email: string, role: string): string => {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new InternalServerError("JWT_SECRET is not configured");
  }

  return jwt.sign(
    {
      userId,
      email,
      role,
    },
    secret,
    {
      expiresIn: TOKEN_EXPIRY,
    }
  );
};

/**
 * Helper function untuk hash password
 */
const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Helper function untuk verify password
 */
const verifyPassword = async (
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

export const AuthService = {
  /**
   * Register user baru
   *
   * @throws {ConflictError} jika email sudah terdaftar
   * @throws {InternalServerError} jika JWT_SECRET tidak dikonfigurasi
   */
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
      select: { id: true },
    });

    if (existingUser) throw new ConflictError("Email already registered");

    // hash password
    const hashedPassword = await hashPassword(password);

    // create user baru
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: Role.USER,
      },
      select: userSelectSafe,
    });

    // setelah user berhasil dibuat, langsung buat token
    const token = generateToken(newUser.id, newUser.email, newUser.role);

    return {
      user: newUser,
      token,
    };
  },

  /**
   * Login user
   *
   * @throws {UnauthorizedError} jika credentials invalid
   * @throws {InternalServerError} jika JWT_SECRET tidak dikonfigurasi
   */
  async login({ email, password }: Pick<User, "email" | "password">) {
    // cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: {
        email,
        ...notDeletedWhere,
      },
    });

    // kondisi jika user tidak ditemukan
    if (!user) throw new UnauthorizedError("Invalid email or password");

    // bandingkan password yang diinput dengan hash di database
    const isValidPassword = await verifyPassword(password, user.password);

    // kondisi jika password salah
    if (!isValidPassword)
      throw new UnauthorizedError("Invalid email or password");

    // kondisi jika password benar, buat web token (JWT)
    const token = generateToken(user.id, user.email, user.role);

    return { token };
  },
};
