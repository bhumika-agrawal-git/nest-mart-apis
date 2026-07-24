import express from "express";
import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();


router.get("/", getBrands);

router.get("/:id", getBrandById);

router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  updateBrand
);

router.delete("/:id", authMiddleware, adminMiddleware, deleteBrand);


router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.single("image"),
  createBrand
);

export default router;