import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";

export const UserController = {
  getAllUsers: asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const users = await UserService.getAllUsers();

      res.status(200).json({
        data: users,
      });
    }
  ),

  getUserById: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      res.status(200).json({
        data: user,
      });
    }
  ),

  updateUser: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const currentUserId = req.user?.id;

      if (!currentUserId)
        throw new ApiError(
          401,
          "Authentication failed. User ID not found on request."
        );

      const user = await UserService.updateUser(id, req.body, currentUserId);

      res.status(200).json({
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
        data: articles,
      });
    }
  ),
};
