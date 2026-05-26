import express from "express";
import { getUser, createUser, updateUser, deleteUser, createManyUsers } from "../controllers/userController.js";

const router = express.Router();

router.get("/", getUser);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.post("/bulk", createManyUsers);
export default router;