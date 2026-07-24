import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();


router.get("/", getCategories);
router.get("/:id", getCategoryById);   // <-- Required

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  updateCategory
);
router.delete("/:id", authMiddleware, adminMiddleware, deleteCategory);

router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  createCategory
);

export default router;