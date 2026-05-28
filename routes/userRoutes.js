import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { 
	getUser, 
	createUser, 
	updateUser, 
	deleteUser, 
	createManyUsers,
	registerUser,
	loginUser
  } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUser);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/bulk", createManyUsers);
router.post("/login", loginUser);
router.post("/register", registerUser);
export default router;