import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import { asyncHandler } from "../utils/asyncHandler";

export const AuthController = {
  // controller untuk register
  register: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      // terima 'user' dan 'token' dari service
      const { user, token } = await AuthService.register(req.body);

      // kirim response sukses
      res.status(201).json({
        message: "User created successfully",
        data: {
          user,
          token,
        },
      });
    }
  ),

  login: asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      // terima token dari service
      const { token } = await AuthService.login(req.body);

      // kirim response sukses
      res.status(200).json({
        message: "Login successful",
        data: { token },
      });
    }
  ),
};
