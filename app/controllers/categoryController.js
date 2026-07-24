import Category from "../models/category.js";
import { categoryValidation } from "../validations/categoryValidation.js";
import {
  uploadSingleImage,
  deleteImage,
} from "../utils/cloudinaryHelper.js";
import { responseHandler } from "../utils/responseHandler.js";
import { getPagination } from "../utils/pagination.js";

// =======================
// Create Category
// =======================
export const createCategory = async (req, res) => {
  try {
    const { error } = categoryValidation.validate(req.body);

    if (error) {
      return responseHandler(
        res,
        400,
        false,
        error.details[0].message
      );
    }

    const { category_name } = req.body;

    const status =
      req.body.status === undefined
        ? true
        : req.body.status.trim().toLowerCase() === "true";

    const existingCategory = await Category.findOne({ category_name });

    if (existingCategory) {
      return responseHandler(
        res,
        400,
        false,
        "Category already exists."
      );
    }

    let image = "";

    if (req.file) {
      const uploadedImage = await uploadSingleImage(req.file, "categories");
      image = uploadedImage.secure_url;
    }

    const category = await Category.create({
      category_name,
      image,
      status,
    });

    return responseHandler(
      res,
      201,
      true,
      "Category created successfully.",
      category
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

// =======================
// Get Categories
// =======================
export const getCategories = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const total = await Category.countDocuments();

    const categories = await Category.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return responseHandler(
      res,
      200,
      true,
      "Categories fetched successfully.",
      categories,
      {
        page,
        limit,
        totalRecords: total,
        totalPages: Math.ceil(total / limit),
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

// =======================
// Get Category By Id
// =======================
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return responseHandler(
        res,
        404,
        false,
        "Category not found."
      );
    }

    return responseHandler(
      res,
      200,
      true,
      "Category fetched successfully.",
      category
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

// =======================
// Update Category
// =======================
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return responseHandler(
        res,
        404,
        false,
        "Category not found."
      );
    }

    if (req.body.category_name) {
      const existing = await Category.findOne({
        category_name: req.body.category_name,
        _id: { $ne: id },
      });

      if (existing) {
        return responseHandler(
          res,
          400,
          false,
          "Category already exists."
        );
      }

      category.category_name = req.body.category_name;
    }

    if (req.body.status !== undefined) {
      category.status =
        req.body.status.toString().trim().toLowerCase() === "true";
    }

    if (req.file) {
      if (category.image) {
        try {
          const publicId = category.image
            .split("/")
            .slice(-2)
            .join("/")
            .split(".")[0];

          await deleteImage(publicId);
        } catch {}
      }

      const uploadedImage = await uploadSingleImage(req.file, "categories");

      category.image = uploadedImage.secure_url;
    }

    await category.save();

    return responseHandler(
      res,
      200,
      true,
      "Category updated successfully.",
      category
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

// =======================
// Delete Category
// =======================
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return responseHandler(
        res,
        404,
        false,
        "Category not found."
      );
    }

    if (category.image) {
      try {
        const publicId = category.image
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];

        await deleteImage(publicId);
      } catch {}
    }

    await Category.findByIdAndDelete(req.params.id);

    return responseHandler(
      res,
      200,
      true,
      "Category deleted successfully."
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