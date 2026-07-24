import Address from "../models/address.js";
import { addressValidation } from "../validations/addressValidation.js";
import { responseHandler } from "../utils/responseHandler.js";
import { getPagination } from "../utils/pagination.js";

// ===============================
// Add Address
// ===============================
export const addAddress = async (req, res) => {
  try {
    const { error } = addressValidation.validate(req.body);

    if (error) {
      return responseHandler(
        res,
        400,
        false,
        error.details[0].message
      );
    }

    if (req.body.is_default) {
      await Address.updateMany(
        { user_id: req.user._id },
        { is_default: false }
      );
    }

    const address = await Address.create({
      ...req.body,
      user_id: req.user._id,
    });

    return responseHandler(
      res,
      201,
      true,
      "Address added successfully.",
      address
    );
  } catch (error) {
    console.log(error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};

// ===============================
// Get All Addresses
// ===============================
export const getAddresses = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);

    const filter = {
      user_id: req.user._id,
    };

    const totalRecords = await Address.countDocuments(filter);

    const addresses = await Address.find(filter)
      .sort({
        is_default: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    return responseHandler(
      res,
      200,
      true,
      "Addresses fetched successfully.",
      addresses,
      {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      }
    );
  } catch (error) {
    console.log(error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};

// ===============================
// Get Address By Id
// ===============================
export const getAddressById = async (req, res) => {
  try {
    const address = await Address.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!address) {
      return responseHandler(
        res,
        404,
        false,
        "Address not found."
      );
    }

    return responseHandler(
      res,
      200,
      true,
      "Address fetched successfully.",
      address
    );
  } catch (error) {
    console.log(error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};

// ===============================
// Update Address
// ===============================
export const updateAddress = async (req, res) => {
  try {
    const { error } = addressValidation.validate(req.body);

    if (error) {
      return responseHandler(
        res,
        400,
        false,
        error.details[0].message
      );
    }

    const address = await Address.findOne({
      _id: req.params.id,
      user_id: req.user._id,
    });

    if (!address) {
      return responseHandler(
        res,
        404,
        false,
        "Address not found."
      );
    }

    if (req.body.is_default) {
      await Address.updateMany(
        { user_id: req.user._id },
        { is_default: false }
      );
    }

    Object.assign(address, req.body);

    await address.save();

    return responseHandler(
      res,
      200,
      true,
      "Address updated successfully.",
      address
    );
  } catch (error) {
    console.log(error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};

// ===============================
// Delete Address
// ===============================
export const deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findOne({
      _id: id,
      user_id: req.user._id,
    });

    if (!address) {
      return responseHandler(
        res,
        404,
        false,
        "Address not found."
      );
    }

    await Address.findByIdAndDelete(id);

    return responseHandler(
      res,
      200,
      true,
      "Address deleted successfully."
    );

  } catch (error) {
    console.error("Delete Address Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};
// ===============================
// Set Default Address
// ===============================
export const setDefaultAddress = async (req, res) => {
  try {
    await Address.updateMany(
      { user_id: req.user._id },
      { is_default: false }
    );

    const address = await Address.findOneAndUpdate(
      {
        _id: req.params.id,
        user_id: req.user._id,
      },
      {
        is_default: true,
      },
      {
        new: true,
      }
    );

    if (!address) {
      return responseHandler(
        res,
        404,
        false,
        "Address not found."
      );
    }

    return responseHandler(
      res,
      200,
      true,
      "Default address updated successfully.",
      address
    );
  } catch (error) {
    console.log(error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};