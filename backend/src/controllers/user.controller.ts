import { Request, Response, NextFunction } from "express";
import { UserService } from "../services/user.service";
import { updateUserValidationSchema } from "../auth/auth.validation";

export const UserController = {
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const users = await UserService.getAllUsers();

      res.status(200).json({
        data: users,
      });
    } catch (err) {
      next(err);
    }
  },

  async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = await UserService.getUserById(id);

      res.status(200).json({
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },

  async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id;
      if (!currentUserId) throw new Error("Authentication failed");

      const validatedBody = updateUserValidationSchema.parse(req.body);
      const user = await UserService.updateUser(
        id,
        validatedBody,
        currentUserId
      );

      res.status(200).json({
        message: "User updated successfully",
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },

  async getArticlesByUserId(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const articles = await UserService.getArticlesByUserId(id);

      res.status(200).json({
        data: articles,
      });
    } catch (err) {
      next(err);
    }
  },
};
