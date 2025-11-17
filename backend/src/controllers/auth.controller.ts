import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service";
import {
  registerValidationSchema,
  loginValidationSchema,
} from "../auth/auth.validation";

export const AuthController = {
  // controller untuk register
  async register(req: Request, res: Response, next: NextFunction) {
    // validasi body req
    const validatedBody = registerValidationSchema.parse(req.body);

    // terima 'user' dan 'token' dari service
    const { user, token } = await AuthService.register(validatedBody);

    // kirim response sukses
    res.status(201).json({
      message: "User created successfully",
      data: {
        user,
        token,
      },
    });
  },

  async login(req: Request, res: Response, next: NextFunction) {
    // validasi body req
    const validatedBody = loginValidationSchema.parse(req.body);

    // terima token dari service
    const { token } = await AuthService.login(validatedBody);

    // kirim response sukses
    res.status(200).json({
      message: "Login successful",
      data: { token },
    });
  },
};
