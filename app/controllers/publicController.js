import Category from "../models/category.js";
import Brand from "../models/brand.js";
import Product from "../models/product.js";
import { responseHandler } from "../utils/responseHandler.js";
import { getPagination } from "../utils/pagination.js";
// =========================
// Get All Categories
// =========================
export const getCategories = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const filter = { status: true };

    const totalRecords = await Category.countDocuments(filter);

    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return responseHandler(
      res,
      200,
      true,
      "Categories fetched successfully.",
      categories,
      {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      }
    );
  } catch (error) {
    console.error("Get Categories Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};

// =========================
// Get All Brands
// =========================
export const getBrands = async (req, res) => {
  try {
   const { page, limit, skip } = getPagination(req);

    const filter = { status: true };

    const totalRecords = await Brand.countDocuments(filter);

    const brands = await Brand.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return responseHandler(
      res,
      200,
      true,
      "Brands fetched successfully.",
      brands,
      {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      }
    );
  } catch (error) {
    console.error("Get Brands Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};

// =========================
// Get Product By ID
// =========================
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findOne({
      _id: id,
      status: true,
    })
      .populate("category_id", "category_name image")
      .populate("brand_id", "brand_name image");

    if (!product) {
      return responseHandler(
        res,
        404,
        false,
        "Product not found."
      );
    }

    return responseHandler(
      res,
      200,
      true,
      "Product fetched successfully.",
      product
    );
  } catch (error) {
    console.error("Get Product Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};
// =========================
// Get All Products
// =========================
export const getProducts = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const { search, category_id, brand_id } = req.query;

    // Base filter
    const filter = {
      status: true,
    };

    // Search by product name
    if (search) {
      filter.product_name = {
        $regex: search,
        $options: "i",
      };
    }

    // Filter by category
    if (category_id) {
      filter.category_id = category_id;
    }

    // Filter by brand
    if (brand_id) {
      filter.brand_id = brand_id;
    }

    // Total records
    const totalRecords = await Product.countDocuments(filter);

    // Get products
    const products = await Product.find(filter)
      .populate("category_id", "category_name image")
      .populate("brand_id", "brand_name image")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    return responseHandler(
      res,
      200,
      true,
      "Products fetched successfully.",
      products,
      {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      }
    );

  } catch (error) {
    console.error("Get Products Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};