import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../errors/custom.error";
import { Prisma } from "../generated/prisma/client";

/**
 * Interface untuk error response
 */
interface ErrorResponse {
  success: boolean;
  message: string;
  errors?: any;
  stack?: string;
}

/**
 * Helper function untuk format Zod errors
 */
const formatZodErrors = (error: ZodError) => {
  return error.issues.map((err) => ({
    field: err.path.join("."),
    message: err.message,
  }));
};

/**
 * Centralized error handling middleware
 *
 * Handles:
 * - Custom AppError
 * - Zod validation errors
 * - Prisma errors
 * - Generic errors
 */
export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log error untuk debugging
  console.error("ERROR:", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  const response: ErrorResponse = {
    success: false,
    message: err.message || "Internal Server Error",
  };

  // handle AppError kostom
  if (err instanceof AppError) {
    return res.status(err.statusCode).json(response);
  }

  // handle zod validation errors
  if (err instanceof ZodError) {
    response.message = "Validation error";
    response.errors = formatZodErrors(err);
    return res.status(400).json(response);
  }

  // handle error unik dari Prisma
  if (err.code) {
    // prisma unique constraint violation
    if (err.code === "P2002") {
      response.message = `${err.meta?.target?.[0] || "Field"} already exists`;
      res.status(409).json(response);
    }

    // prisma foreign key constraint violation
    if (err.code === "P2003") {
      response.message = "Referenced record does not exists";
      return res.status(400).json(response);
    }

    // Prisma record not found
    if (err.code === "P2025") {
      response.message = "Record not found";
      return res.status(404).json(response);
    }
  }

  // Handle JWT errors (fallback jika tidak tertangkap di middleware)
  if (err.name === "JsonWebTokenError") {
    response.message = "Invalid token";
    return res.status(401).json(response);
  }

  if (err.name === "TokenExpiredError") {
    response.message = "Token has expired";
    return res.status(401).json(response);
  }

  // error generik
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  return res.status(500).json(response);
};

/**
 * Not Found handler (404)
 * Harus dipasang SEBELUM error handler
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.path} not found`,
  });
};

/**
 * Async handler wrapper
 * Untuk catch async errors di controller
 *
 * Usage:
 * router.get('/', asyncHandler(YourController.method))
 */
type AsyncController = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const asyncHandler =
  (controller: AsyncController) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(controller(req, res, next)).catch(next);
  };
