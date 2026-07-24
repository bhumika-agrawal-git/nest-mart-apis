import Product from "../models/product.js";
import Category from "../models/category.js";
import Brand from "../models/brand.js";
import { productValidation } from "../validations/productValidation.js";
import {
  uploadSingleImage,
  deleteImage,
} from "../utils/cloudinaryHelper.js";
import { responseHandler } from "../utils/responseHandler.js";
import { getPagination } from "../utils/pagination.js";

// ======================
// Create Product
// ======================
export const createProduct = async (req, res) => {
  try {
    const { error } = productValidation.validate(req.body);

    if (error) {
      return responseHandler(
        res,
        400,
        false,
        error.details[0].message
      );
    }

    const {
      product_name,
      category_id,
      brand_id,
      description,
      price,
      discount_price,
      quantity,
      unit,
    } = req.body;

    const status =
      req.body.status === undefined
        ? true
        : req.body.status.toString().trim().toLowerCase() === "true";

    // Check Category
    const category = await Category.findById(category_id);

    if (!category) {
      return responseHandler(
        res,
        404,
        false,
        "Category not found."
      );
    }

    // Check Brand
    const brand = await Brand.findById(brand_id);

    if (!brand) {
      return responseHandler(
        res,
        404,
        false,
        "Brand not found."
      );
    }

    // Upload Images
    let images = [];

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const uploadedImage = await uploadSingleImage(
          file,
          "products"
        );

        images.push({
          url: uploadedImage.secure_url,
          public_id: uploadedImage.public_id,
        });
      }
    }

    const product = await Product.create({
      product_name,
      category_id,
      brand_id,
      description,
      price,
      discount_price,
      quantity,
      unit,
      images,
      status,
    });

    return responseHandler(
      res,
      201,
      true,
      "Product created successfully.",
      product
    );
  } catch (error) {
    console.error("Create Product Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};

// ======================
// Get All Products
// ======================
export const getProducts = async (req, res) => {
  try {
    const { search } = req.query;

   const { page, limit, skip } = getPagination(req);

    const filter = {
      status: true,
    };

    if (search) {
      filter.product_name = {
        $regex: search,
        $options: "i",
      };
    }

    const totalRecords = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .populate("category_id", "category_name")
      .populate("brand_id", "brand_name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

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
// ======================
// Get Product By ID
// ======================
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate("category_id", "category_name")
      .populate("brand_id", "brand_name");

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

// ======================
// Update Product
// ======================
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      product_name,
      category_id,
      brand_id,
      description,
      price,
      discount_price,
      quantity,
      unit,
    } = req.body;

    const product = await Product.findById(id);

    if (!product) {
      return responseHandler(
        res,
        404,
        false,
        "Product not found."
      );
    }

    // Validate Category
    if (category_id) {
      const category = await Category.findById(category_id);

      if (!category) {
        return responseHandler(
          res,
          404,
          false,
          "Category not found."
        );
      }

      product.category_id = category_id;
    }

    // Validate Brand
    if (brand_id) {
      const brand = await Brand.findById(brand_id);

      if (!brand) {
        return responseHandler(
          res,
          404,
          false,
          "Brand not found."
        );
      }

      product.brand_id = brand_id;
    }

    // Update Fields
    if (product_name) {
      product.product_name = product_name;
    }

    if (description) {
      product.description = description;
    }

    if (price !== undefined) {
      product.price = price;
    }

    if (discount_price !== undefined) {
      product.discount_price = discount_price;
    }

    if (quantity !== undefined) {
      product.quantity = quantity;
    }

    if (unit) {
      product.unit = unit;
    }

    // Boolean Status
    if (req.body.status !== undefined) {
      product.status =
        req.body.status
          .toString()
          .trim()
          .toLowerCase() === "true";
    }

    // Replace Images
    if (req.files && req.files.length > 0) {

      // Delete old images from Cloudinary
      if (product.images.length > 0) {
        for (const img of product.images) {
          if (img.public_id) {
            await deleteImage(img.public_id);
          }
        }
      }

      const newImages = [];

      for (const file of req.files) {
        const uploadedImage = await uploadSingleImage(
          file,
          "products"
        );

        newImages.push({
          url: uploadedImage.secure_url,
          public_id: uploadedImage.public_id,
        });
      }

      product.images = newImages;
    }

    await product.save();

    return responseHandler(
      res,
      200,
      true,
      "Product updated successfully.",
      product
    );
  } catch (error) {
    console.error("Update Product Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};
// =========================
// Delete Product
// =========================
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return responseHandler(
        res,
        404,
        false,
        "Product not found."
      );
    }

    // Delete images from Cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.public_id) {
          await deleteImage(image.public_id);
        }
      }
    }

    await Product.findByIdAndDelete(id);

    return responseHandler(
      res,
      200,
      true,
      "Product deleted successfully."
    );

  } catch (error) {
    console.error("Delete Product Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};