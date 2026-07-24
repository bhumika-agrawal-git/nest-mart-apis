import Brand from "../models/brand.js";
import { brandValidation } from "../validations/brandValidation.js";
import {
  uploadSingleImage,
  deleteImage,
} from "../utils/cloudinaryHelper.js";
import { responseHandler } from "../utils/responseHandler.js";
import { getPagination } from "../utils/pagination.js";

// ======================
// Create Brand
// ======================
export const createBrand = async (req, res) => {
  try {
    const { error } = brandValidation.validate(req.body);

    if (error) {
      return responseHandler(
        res,
        400,
        false,
        error.details[0].message
      );
    }

    const { brand_name } = req.body;

    const status =
      req.body.status === undefined
        ? true
        : req.body.status.trim().toLowerCase() === "true";

    const existingBrand = await Brand.findOne({ brand_name });

    if (existingBrand) {
      return responseHandler(
        res,
        400,
        false,
        "Brand already exists."
      );
    }

    let image = null;

    if (req.file) {
      const uploadedImage = await uploadSingleImage(req.file, "brands");

      image = {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      };
    }

    const brand = await Brand.create({
      brand_name,
      image,
      status,
    });

    return responseHandler(
      res,
      201,
      true,
      "Brand created successfully.",
      brand
    );
  } catch (error) {
    console.error("Create Brand Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};

// ======================
// Get All Brands
// ======================
export const getBrands = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const totalRecords = await Brand.countDocuments();

    const brands = await Brand.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

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

// ======================
// Get Brand By ID
// ======================
export const getBrandById = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);

    if (!brand) {
      return responseHandler(
        res,
        404,
        false,
        "Brand not found."
      );
    }

    return responseHandler(
      res,
      200,
      true,
      "Brand fetched successfully.",
      brand
    );
  } catch (error) {
    console.error("Get Brand Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};

// ======================
// Update Brand
// ======================
export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);

    if (!brand) {
      return responseHandler(
        res,
        404,
        false,
        "Brand not found."
      );
    }

    const { brand_name } = req.body;

    if (brand_name) {
      const existingBrand = await Brand.findOne({
        brand_name,
        _id: { $ne: id },
      });

      if (existingBrand) {
        return responseHandler(
          res,
          400,
          false,
          "Brand already exists."
        );
      }

      brand.brand_name = brand_name;
    }

    if (req.body.status !== undefined) {
      brand.status =
        req.body.status.toString().trim().toLowerCase() === "true";
    }

    if (req.file) {
      if (brand.image?.public_id) {
        await deleteImage(brand.image.public_id);
      }

      const uploadedImage = await uploadSingleImage(req.file, "brands");

      brand.image = {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      };
    }

    await brand.save();

    return responseHandler(
      res,
      200,
      true,
      "Brand updated successfully.",
      brand
    );
  } catch (error) {
    console.error("Update Brand Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};

// ======================
// Delete Brand
// ======================
export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;

    const brand = await Brand.findById(id);

    if (!brand) {
      return responseHandler(
        res,
        404,
        false,
        "Brand not found."
      );
    }

    if (brand.image?.public_id) {
      await deleteImage(brand.image.public_id);
    }

    await Brand.findByIdAndDelete(id);

    return responseHandler(
      res,
      200,
      true,
      "Brand deleted successfully."
    );
  } catch (error) {
    console.error("Delete Brand Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};