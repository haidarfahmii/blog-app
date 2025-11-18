import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";
import { ZodError } from "zod";
import { Prisma } from "../generated/prisma/client";

/**
 * Middleware Error Handler terpusat
 * menangani berbagai jenis error dan mengirim respons JSON yang konsisten
 */
export const errorHandler = (
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = "Something went wrong";

  // menangani ApiError kostom
  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // tangani error validasi Zod
  else if (err instanceof ZodError) {
    statusCode = 400; // BadRequest
    message = err.issues.map((issue) => issue.message).join(", ");
  }

  // tangani error unik dari Prisma
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      statusCode = 409; // Conflict
      const target = (err.meta?.target as string[])?.join(", ");
      message = `Unique constraint failed: ${target} already exists.`;
    } else {
      message = err.message;
    }
  }

  // error generik
  else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
