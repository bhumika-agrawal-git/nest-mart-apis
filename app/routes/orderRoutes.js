import express from "express";

import {
  createOrder,
  getOrderHistory,
  getOrderById,
  cancelOrder,
} from "../controllers/orderController.js";

import {
  authMiddleware,
} from "../middlewares/authMiddleware.js";

const router = express.Router();


// Create Order
router.post(
  "/",
  authMiddleware,
  createOrder
);


// Get All Orders
router.get(
  "/",
  authMiddleware,
  getOrderHistory
);


// Get Order By ID
router.get(
  "/:order_id",
  authMiddleware,
  getOrderById
);


// Cancel Order
router.patch(
  "/:order_id/cancel",
  authMiddleware,
  cancelOrder
);


export default router;