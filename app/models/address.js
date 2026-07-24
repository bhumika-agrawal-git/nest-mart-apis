import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    full_name: {
      type: String,
      required: true,
      trim: true,
    },

    phone_no: {
      type: String,
      required: true,
      trim: true,
    },

    address_line_1: {
      type: String,
      required: true,
      trim: true,
    },

    address_line_2: {
      type: String,
      trim: true,
    },

    landmark: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      default: "India",
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    address_type: {
      type: String,
      enum: ["Home", "Work", "Other"],
      default: "Home",
    },

    is_default: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Address =
  mongoose.models.Address || mongoose.model("Address", addressSchema);

export default Address;