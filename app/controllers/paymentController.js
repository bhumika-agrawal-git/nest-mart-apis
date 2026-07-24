import razorpay from "../configs/razorpay.js";
import Order from "../models/Order.js";
import { responseHandler } from "../utils/responseHandler.js";
import crypto from "crypto";

// =================================================
// CREATE RAZORPAY ORDER
// =================================================
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return responseHandler(
        res,
        400,
        false,
        "Valid amount is required."
      );
    }

    const options = {
      amount: Math.round(amount * 100), // ₹790 = 79000 paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const razorpayOrder =
      await razorpay.orders.create(options);

    return responseHandler(
      res,
      200,
      true,
      "Razorpay order created successfully.",
      {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }
    );

  } catch (error) {
    console.error(
      "Create Razorpay Order Error:",
      error
    );

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};


// =================================================
// VERIFY RAZORPAY PAYMENT
// =================================================
export const verifyRazorpayPayment = async (
  req,
  res
) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return responseHandler(
        res,
        400,
        false,
        "Payment details are required."
      );
    }

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    if (
      generatedSignature !==
      razorpay_signature
    ) {
      return responseHandler(
        res,
        400,
        false,
        "Invalid payment signature."
      );
    }

    return responseHandler(
      res,
      200,
      true,
      "Payment verified successfully.",
      {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      }
    );

  } catch (error) {
    console.error(
      "Verify Payment Error:",
      error
    );

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};