import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.config";
import { User } from "../generated/prisma/client";
import { ApiError } from "../utils/ApiError";

// definisi tipe express
declare global {
  namespace Express {
    export interface Request {
      user?: Omit<User, "password">;
    }
  }
}

interface JwtPayload {
  userId: string;
}

export const authenticateToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (token == null) {
      // Gunakan next() dengan ApiError
      return next(new ApiError(401, "Authentication token required"));
    }

    // Kita bisa pakai '!' karena sudah dicek di server.ts
    const secret = process.env.JWT_SECRET!;

    const payload = jwt.verify(token, secret) as JwtPayload;
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
        deletedAt: null,
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

    if (!user) {
      return next(new ApiError(403, "Invalid token or user does not exist"));
    }

    req.user = user;
    next();
  } catch (err) {
    // Tangani error JWT (misal: token expired)
    if (err instanceof jwt.JsonWebTokenError) {
      return next(new ApiError(403, `Invalid token: ${err.message}`));
    }
    // Teruskan error lainnya
    return next(err);
  }
};
