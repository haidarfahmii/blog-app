import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticateToken } from "../middlewares/auth.middleware";

const router = Router();

router.get("/", UserController.getAllUsers);
router.get("/:id", UserController.getUserById);
router.get("/:id/articles", UserController.getArticlesByUserId);

// hanya pengguna yang terontentikasi yang dapat memperbaharui profilenya
router.patch("/:id", authenticateToken, UserController.updateUser);

export default router;
