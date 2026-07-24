import express from "express";
import { authMiddleware } from "../middlewares/authMiddleware.js";
import {
  toggleWishlist,
 getWishlist,
} from "../controllers/wishlistController.js";

const router = express.Router();

router.post(
  "/toggle",
  authMiddleware,
  toggleWishlist
);

router.get(
  "/",
  authMiddleware,
  getWishlist
);

export default router;