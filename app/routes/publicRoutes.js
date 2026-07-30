import express from "express";
import {
  getCategories,
  getBrands,
  getProductById,
   getProducts,
} from "../controllers/publicController.js";

const router = express.Router();

router.get("/categories", getCategories);

router.get("/brands", getBrands);

router.get("/products/:id", getProductById);
router.get("/products", getProducts);

export default router;
