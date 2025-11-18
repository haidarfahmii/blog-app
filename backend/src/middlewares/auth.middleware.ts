import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.config";
import { User } from "../generated/prisma/client";
import { UnauthorizedError, InternalServerError } from "../errors/custom.error";
import { userSelectSafe, notDeletedWhere } from "../constants/prisma.selects";

// definisi tipe express
declare global {
  namespace Express {
    export interface Request {
      user?: Omit<User, "password" | "deletedAt">;
    }
  }
}

interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Helper function untuk extract token dari Authorization header
 */
const extractToken = (authHeader: string | undefined): string | null => {
  if (!authHeader) return null;

  const parts = authHeader.split(" ");

  // format harus: "Bearer <token>"
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    return null;
  }

  return parts[1];
};

/**
 * Helper function untuk verify JWT token
 */
const verifyToken = (token: string, secret: string): JwtPayload => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError("Token has expired");
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError("Invalid token");
    }
    throw new UnauthorizedError("Token verification failed");
  }
};

/**
 * Middleware untuk authenticate user menggunakan JWT token
 *
 * Flow:
 * 1. Extract token dari Authorization header
 * 2. Verify token validity
 * 3. Fetch user dari database
 * 4. Attach user ke request object
 *
 * @throws {UnauthorizedError} jika token tidak valid atau user tidak ditemukan
 */

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // extract token
    const token = extractToken(req.headers.authorization);
    if (!token) {
      throw new UnauthorizedError("Authentication token is required");
    }

    // verify token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new InternalServerError("JWT_SECRET is not configured");
    }

    const payload = verifyToken(token, secret);

    // fetch user dari database
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
        ...notDeletedWhere,
      },
      select: userSelectSafe,
    });

    // validate user existence
    if (!user) {
      throw new UnauthorizedError("User not found or has been deleted");
    }

    // attach user ke request
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware optional authentication
 * Tidak akan throw error jika token tidak ada, tapi attach user jika token valid
 *
 * Use case: Endpoint yang bisa diakses dengan atau tanpa login
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      // tidak ada token, lanjutkan tanpa user
      return next();
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return next();
    }

    try {
      const payload = verifyToken(token, secret);

      const user = await prisma.user.findUnique({
        where: {
          id: payload.userId,
          ...notDeletedWhere,
        },
        select: userSelectSafe,
      });

      if (user) {
        req.user = user;
      }
    } catch (error) {
      // jika token invalid (expired, dll.), lanjutkan tanpa user (tidak throw error)
    }
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware untuk memastikan user yang login adalah pemilik resource
 *
 * @param resourceUserId - User ID dari resource yang akan diakses
 * @throws {ForbiddenError} jika user bukan pemilik resource
 */
export const requiredOwnership = (resourceUserId: string) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new UnauthorizedError("User not authenticated");
    }

    if (req.user.id !== resourceUserId) {
      throw new UnauthorizedError(
        "User is not authorized to access this resource"
      );
    }
    next();
  };
};
