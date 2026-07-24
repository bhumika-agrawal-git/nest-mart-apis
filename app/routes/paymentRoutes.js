import express from "express";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/paymentController.js";

import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();


// Create Razorpay Order
router.post(
  "/create-order",
  authMiddleware,
  createRazorpayOrder
);


// Verify Payment
router.post(
  "/verify",
  authMiddleware,
  verifyRazorpayPayment
);


export default router;