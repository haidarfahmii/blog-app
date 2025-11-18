import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticateToken } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { updateUserValidationSchema } from "../validations/auth.validation";

const router = Router();

/**
 * Public routes
 */
// GET /api/users - Get all users
router.get("/", UserController.getAllUsers);
// GET /api/users/:id - Get user by ID
router.get("/:id", UserController.getUserById);
// GET /api/users/:id/articles - Get user's articles
router.get("/:id/articles", UserController.getArticlesByUserId);

/**
 * Protected routes (require authentication)
 */
// hanya pengguna yang terontentikasi yang dapat memperbaharui profilenya
router.patch(
  "/:id",
  authenticateToken,
  validate(updateUserValidationSchema),
  UserController.updateUser
);

// DELETE /api/users/:id - Delete user account
router.delete("/:id", authenticateToken, UserController.deleteUser);

export default router;
