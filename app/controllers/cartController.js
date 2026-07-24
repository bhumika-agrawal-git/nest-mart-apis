import Cart from "../models/cart.js";
import Product from "../models/product.js";
import { responseHandler } from "../utils/responseHandler.js";
import { getPagination } from "../utils/pagination.js";

// ==========================
// Add To Cart
// ==========================
export const addToCart = async (req, res) => {
  try {
    const user_id = req.user._id;
    const { product_id, quantity } = req.body;

    const product = await Product.findById(product_id);

    if (!product) {
      return responseHandler(
        res,
        404,
        false,
        "Product not found."
      );
    }

    let cart = await Cart.findOne({
      user_id,
      product_id,
    });

    if (cart) {
      cart.quantity += Number(quantity) || 1;

      await cart.save();

      return responseHandler(
        res,
        200,
        true,
        "Cart updated successfully.",
        cart
      );
    }

    cart = await Cart.create({
      user_id,
      product_id,
      quantity: Number(quantity) || 1,
    });

    return responseHandler(
      res,
      201,
      true,
      "Product added to cart.",
      cart
    );
  } catch (error) {
    console.error(error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};

// ==========================
// Get Cart
// ==========================
export const getCart = async (req, res) => {
  try {
    const user_id = req.user._id;

    const { page, limit, skip } = getPagination(req);

    const filter = { user_id };

    const totalRecords = await Cart.countDocuments(filter);

    const cart = await Cart.find(filter)
      .populate("product_id")
      .populate("user_id", "first_name last_name email")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return responseHandler(
      res,
      200,
      true,
      "Cart fetched successfully.",
      cart,
      {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      }
    );
  } catch (error) {
    console.error(error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};
// ==========================
// Get Cart By ID
// ==========================
export const getCartById = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findOne({
      _id: id,
      user_id: req.user._id,
    })
      .populate("product_id")
      .populate(
        "user_id",
        "first_name last_name email"
      );

    if (!cart) {
      return responseHandler(
        res,
        404,
        false,
        "Cart item not found."
      );
    }

    return responseHandler(
      res,
      200,
      true,
      "Cart item fetched successfully.",
      cart
    );

  } catch (error) {
    console.error(error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};
// ==========================
// Update Cart Quantity
// ==========================
export const updateCartQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity } = req.body;

    const cart = await Cart.findOne({
      _id: id,
      user_id: req.user._id,
    });

    if (!cart) {
      return responseHandler(
        res,
        404,
        false,
        "Cart item not found."
      );
    }

    cart.quantity = Number(quantity);

    await cart.save();

    return responseHandler(
      res,
      200,
      true,
      "Cart quantity updated successfully.",
      cart
    );
  } catch (error) {
    console.error(error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};

// ==========================
// Remove Cart Item
// ==========================
export const removeCart = async (req, res) => {
  try {
    const { id } = req.params;

    const cart = await Cart.findOneAndDelete({
      _id: id,
      user_id: req.user._id,
    });

    if (!cart) {
      return responseHandler(
        res,
        404,
        false,
        "Cart item not found."
      );
    }

    return responseHandler(
      res,
      200,
      true,
      "Item removed from cart."
    );
  } catch (error) {
    console.error(error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};