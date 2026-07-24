import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    // =========================================
    // ORDER NUMBER
    // =========================================
    order_number: {
      type: String,
      unique: true,
      required: true,
    },

    // =========================================
    // USER
    // =========================================
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    user_details: {
      first_name: {
        type: String,
        required: true,
      },

      last_name: {
        type: String,
        required: true,
      },

      email: {
        type: String,
        required: true,
      },

      phone_no: {
        type: String,
        required: true,
      },
    },

    // =========================================
    // ADDRESS
    // =========================================
    address_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },

    address_details: {
      full_name: {
        type: String,
        required: true,
      },

      phone_no: {
        type: String,
        required: true,
      },

      address_line: {
        type: String,
        required: true,
      },

      city: {
        type: String,
        required: true,
      },

      state: {
        type: String,
        required: true,
      },

      pincode: {
        type: String,
        required: true,
      },
    },

    // =========================================
    // FINANCE DETAILS
    // =========================================
    finance_details: {
      subtotal: {
        type: Number,
        required: true,
      },

      discount: {
        type: Number,
        default: 0,
      },

      delivery_charge: {
        type: Number,
        default: 0,
      },

      tax: {
        type: Number,
        default: 0,
      },

      total_amount: {
        type: Number,
        required: true,
      },
    },

    // =========================================
    // PAYMENT DETAILS
    // =========================================
    payment_details: {

      payment_method: {
        type: String,

        enum: [
          "COD",
          "ONLINE",
        ],

        default: "COD",
      },


      payment_status: {

        type: String,

        enum: [

          "PENDING",

          "PAID",

          "FAILED",

          "REFUNDED",

        ],

        default: "PENDING",

      },


      // Razorpay Order ID
      razorpay_order_id: {

        type: String,

        default: null,

      },


      // Razorpay Payment ID
      razorpay_payment_id: {

        type: String,

        default: null,

      },


      // Optional: Signature
      razorpay_signature: {

        type: String,

        default: null,

      },


      transaction_id: {

        type: String,

        default: null,

      },

    },


    // =========================================
    // ORDER STATUS
    // =========================================
    order_status: {

      type: String,

      enum: [

        "PENDING",

        "CONFIRMED",

        "SHIPPED",

        "DELIVERED",

        "CANCELLED",

      ],

      default: "PENDING",

    },

  },

  {

    timestamps: true,

  }

);

export default mongoose.models.Order ||
  mongoose.model("Order", orderSchema);