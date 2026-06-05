import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { 
	getUser, 
	createUser, 
	updateUser, 
	deleteUser, 
	createManyUsers,
	registerUser,
	loginUser,
  getMe,
  updateUserAccess
  } from "../controllers/userController.js";

const router = express.Router();

router.get("/", authMiddleware, getUser);
router.post("/", authMiddleware, createUser);
router.put("/:id", authMiddleware, updateUser);
router.delete("/:id", authMiddleware, deleteUser);
router.post("/bulk", authMiddleware, createManyUsers);
router.get("/me", authMiddleware, getMe);
router.patch("/:id/access", authMiddleware, updateUserAccess);
router.post("/login", loginUser);
router.post("/register", registerUser);
export default router;
