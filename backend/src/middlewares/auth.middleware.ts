import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.config";
import { User } from "../generated/prisma/client";

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
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (token == null) {
    return res.status(401).json({
      message: "Authentication token required",
    });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) return next(new Error("JWT secret not configured"));

  try {
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
      return res.status(403).json({
        message: "Invalid token or user does not exist",
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(403).json({
      message: "Invalid token",
    });
  }
};
