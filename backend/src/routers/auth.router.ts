import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import {
  registerValidationSchema,
  loginValidationSchema,
} from "../validations/auth.validation";

const router = Router();

router.post(
  "/register",
  validate(registerValidationSchema),
  AuthController.register
);
router.post("/login", validate(loginValidationSchema), AuthController.login);

export default router;
