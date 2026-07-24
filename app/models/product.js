import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    product_name: {
      type: String,
      required: true,
      trim: true,
    },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    description: {
      type: String,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discount_price: {
      type: Number,
      default: 0,
    },

    quantity: {
      type: Number,
      required: true,
      default: 0,
    },

    unit: {
      type: String,
      enum: ["kg", "gm", "ltr", "ml", "pcs", "pack"],
      required: true,
    },
    images: [
  {
    url: {
      type: String,
    },
    public_id: {
      type: String,
    },
  },
],

    status: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);
// const Product = mongoose.model("Product", productSchema);

const Product =
  mongoose.models.Product ||
  mongoose.model("Product", productSchema);

export default Product;