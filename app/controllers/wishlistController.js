import Wishlist from "../models/Wishlist.js";
import Product from "../models/Product.js";
import { responseHandler } from "../utils/responseHandler.js";

// =================================
// Toggle Wishlist
// =================================
export const toggleWishlist = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { product_id } = req.body;

    // Check product ID
    if (!product_id) {
      return responseHandler(
        res,
        400,
        false,
        "Product ID is required."
      );
    }

    // Check Product
    const product = await Product.findOne({
      _id: product_id,
      status: true,
    });

    if (!product) {
      return responseHandler(
        res,
        404,
        false,
        "Product not found."
      );
    }
console.log("skabjdadjhasjkdhaskjdhaskdjhsakjdhaksjdhaskdhas")
    // Check if product already exists in wishlist
    const existingWishlist = await Wishlist.findOne({
      user_id,
      product_id,
    });

    // If exists → Remove from wishlist
    if (existingWishlist) {
      await Wishlist.findByIdAndDelete(existingWishlist._id);

      return responseHandler(
        res,
        200,
        true,
        "Product removed from wishlist."
      );
    }

    // If does not exist → Add to wishlist
    const wishlist = await Wishlist.create({
      user_id,
      product_id,
    });

    return responseHandler(
      res,
      201,
      true,
      "Product added to wishlist.",
      wishlist
    );

  } catch (error) {
    console.error("Toggle Wishlist Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};
// =================================
// Get Wishlist
// =================================
export const getWishlist = async (req, res) => {
  try {
    const user_id = req.user._id;

    const wishlist = await Wishlist.find({ user_id })
      .populate({
        path: "product_id",
        populate: [
          {
            path: "category_id",
            select: "category_name",
          },
          {
            path: "brand_id",
            select: "brand_name",
          },
        ],
      })
      .sort({ createdAt: -1 });

    return responseHandler(
      res,
      200,
      true,
      "Wishlist fetched successfully.",
      wishlist
    );

  } catch (error) {
    console.error("Get Wishlist Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};