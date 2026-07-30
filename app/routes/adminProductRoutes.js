import express from "express";

import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import {
  importProductsFromExcel,
} from "../controllers/productImportController.js";

import {
  authMiddleware,
} from "../middlewares/authMiddleware.js";

import {
  adminMiddleware,
} from "../middlewares/adminMiddleware.js";

import upload, {
  excelUpload,
} from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// ==========================================
// IMPORT PRODUCTS FROM EXCEL
// ==========================================
router.post(
  "/import-excel",
  authMiddleware,
  adminMiddleware,
  excelUpload.single("file"),
  importProductsFromExcel
);

// ==========================================
// CREATE PRODUCT
// ==========================================
router.post(
  "/",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 5),
  createProduct
);

// ==========================================
// GET ALL PRODUCTS
// ==========================================
router.get(
  "/",
  getProducts
);

// ==========================================
// GET PRODUCT BY ID
// ==========================================
router.get(
  "/:id",
  getProductById
);

// ==========================================
// UPDATE PRODUCT
// ==========================================
router.put(
  "/:id",
  authMiddleware,
  adminMiddleware,
  upload.array("images", 5),
  updateProduct
);

// ==========================================
// DELETE PRODUCT
// ==========================================
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  deleteProduct
);

export default router;