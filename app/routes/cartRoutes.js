import express from "express";
import {
  addToCart,
  getCart,
  getCartById,
  updateCartQuantity,
  removeCart,
} from "../controllers/cartController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

                                

const router = express.Router();

router.post("/", authMiddleware, addToCart);   
router.get("/",authMiddleware,  getCart);
router.get(
  "/:id",
  authMiddleware,
  getCartById
);
router.put("/:id", authMiddleware, updateCartQuantity);

router.delete("/:id",authMiddleware,  removeCart);

export default router;