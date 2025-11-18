import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { asyncHandler } from "../middlewares/error.middleware";
import { UnauthorizedError } from "../errors/custom.error";

export const UserController = {
  getAllUsers: asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const users = await UserService.getAllUsers();

      res.status(200).json({
        success: true,
        data: users,
      });
    }
  ),

  getUserById: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      res.status(200).json({
        success: true,
        data: user,
      });
    }
  ),

  updateUser: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const currentUserId = req.user?.id;

      if (!currentUserId)
        throw new UnauthorizedError(
          "Authentication failed. User ID not found on request."
        );

      const user = await UserService.updateUser(id, req.body, currentUserId);

      res.status(200).json({
        success: true,
        message: "User updated successfully",
        data: user,
      });
    }
  ),

  getArticlesByUserId: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const articles = await UserService.getArticlesByUserId(id);

      res.status(200).json({
        success: true,
        data: articles,
      });
    }
  ),

  deleteUser: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        throw new UnauthorizedError("Authentication required");
      }

      const result = await UserService.deleteUser(id, currentUserId);

      res.status(200).json({
        success: true,
        ...result,
      });
    }
  ),
};
