import { Request, Response, NextFunction } from "express";
import { ForbiddenError, UnauthorizedError } from "../errors/custom.error";
import { Role } from "../generated/prisma/client";

/**
 * Middleware untuk memverifikasi role user
 * Harus dipasang SETELAH authenticateToken middleware
 *
 * @param allowedRoles - Array of roles yang diizinkan
 *
 * Usage:
 * router.get('/admin', authenticateToken, requireRole(['ADMIN']), controller)
 */
export const requireRole = (allowedRoles: Role[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    // Pastikan user sudah terautentikasi (dari auth.middleware)
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }

    // Pastikan req.user memiliki properti role (Safety check)
    if (!req.user.role) {
      throw new ForbiddenError("User role is not defined");
    }

    // Check apakah role user ada di dalam array allowedRoles
    if (!allowedRoles.includes(req.user.role)) {
      throw new ForbiddenError(
        `Access denied. You need one of these roles: ${allowedRoles.join(", ")}`
      );
    }

    next();
  };
};

/**
 * Shorthand middleware untuk admin only
 */
export const requireAdmin = requireRole([Role.ADMIN]);

/**
 * Middleware Hybrid: Resource Ownership ATAU Admin
 * Berguna untuk route seperti: DELETE /articles/:id
 * - User biasa: Cek apakah dia pemilik artikel.
 * - Admin: Bypass cek kepemilikan (bisa hapus punya siapa saja).
 */
export const requireOwnershipOrAdmin = (
  getResourceUserId: (req: Request) => string | Promise<string | undefined>
) => {
  return async (
    req: Request,
    _res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }

      // Admin Privilege: Bypass ownership check
      if (req.user.role === Role.ADMIN) {
        return next();
      }

      // User Biasa: Check ownership
      const resourceUserId = await getResourceUserId(req);

      // Jika resource tidak ditemukan (misal artikel null), biarkan controller yang handle 404,
      // atau throw error disini tergantung flow logic kamu.
      // Disini kita lanjut saja agar controller bisa handle "Not Found" secara spesifik.
      if (!resourceUserId) {
        return next();
      }

      if (req.user.id !== resourceUserId) {
        throw new ForbiddenError(
          "You don't have permission to modify this resource"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
