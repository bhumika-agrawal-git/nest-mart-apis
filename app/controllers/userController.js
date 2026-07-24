import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { registerValidation } from "../validations/userValidation.js";
import {
  uploadSingleImage,
  deleteImage,
} from "../utils/cloudinaryHelper.js";
import { responseHandler } from "../utils/responseHandler.js";
import { getPagination } from "../utils/pagination.js";
// =========================
// Register User
// =========================
export const registerUser = async (req, res) => {
  try {
    const { error } = registerValidation.validate(req.body);

    if (error) {
      return responseHandler(
        res,
        400,
        false,
        error.details[0].message
      );
    }

    const {
      first_name,
      last_name,
      email,
      gender,
      password,
      phone_no,
      role,
    } = req.body;

    // Check Email
    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return responseHandler(
        res,
        400,
        false,
        "Email already exists."
      );
    }

    // Check Phone Number
    const phoneExists = await User.findOne({ phone_no });

    if (phoneExists) {
      return responseHandler(
        res,
        400,
        false,
        "Phone number already exists."
      );
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User
    const user = await User.create({
      first_name,
      last_name,
      email,
      gender,
      password: hashedPassword,
      phone_no,
      role,
    });

    return responseHandler(
      res,
      201,
      true,
      "Registration successful.",
      {
        id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        gender: user.gender,
        phone_no: user.phone_no,
        role: user.role,
      }
    );
  } catch (error) {
    console.error("Register Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};

// =========================
// Login User
// =========================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return responseHandler(
        res,
        400,
        false,
        "Email and Password are required."
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return responseHandler(
        res,
        404,
        false,
        "User not found."
      );
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return responseHandler(
        res,
        401,
        false,
        "Invalid email or password."
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    return responseHandler(
      res,
      200,
      true,
      "Login successful.",
      {
        token,
        user: {
          id: user._id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          gender: user.gender,
          phone_no: user.phone_no,
          profile_image: user.profile_image,
          role: user.role,
        },
      }
    );
  } catch (error) {
    console.error("Login Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};
// =========================
// Update User
// =========================
export const updateUser = async (req, res) => {
  try {
    const id = req.user._id;

    const {
      first_name,
      last_name,
      gender,
      phone_no,
    } = req.body;

    // Check User
    const user = await User.findById(id);

    if (!user) {
      return responseHandler(
        res,
        404,
        false,
        "User not found."
      );
    }

    // Check duplicate phone number
    if (phone_no) {
      const existingPhone = await User.findOne({
        phone_no,
        _id: { $ne: id },
      });

      if (existingPhone) {
        return responseHandler(
          res,
          400,
          false,
          "Phone number already exists."
        );
      }
    }

    // Upload Profile Image
    if (req.file) {

      // Delete previous image from Cloudinary
      if (
        user.profile_image &&
        user.profile_image.public_id
      ) {
        await deleteImage(user.profile_image.public_id);
      }

      const uploadedImage = await uploadSingleImage(
        req.file,
        "users"
      );

      user.profile_image = {
        url: uploadedImage.secure_url,
        public_id: uploadedImage.public_id,
      };
    }

    // Update fields
    if (first_name) user.first_name = first_name;
    if (last_name) user.last_name = last_name;
    if (gender) user.gender = gender;
    if (phone_no) user.phone_no = phone_no;

    await user.save();

    return responseHandler(
      res,
      200,
      true,
      "User updated successfully.",
      user
    );

  } catch (error) {
    console.error("Update User Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};

// =========================
// Get All Users (Admin)
// =========================
export const getUsers = async (req, res) => {
  try {

    if (req.user.role !== "admin") {
      return responseHandler(
        res,
        403,
        false,
        "Access denied."
      );
    }

   const { page, limit, skip } = getPagination(req);

    const totalRecords = await User.countDocuments();

    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    return responseHandler(
      res,
      200,
      true,
      "Users fetched successfully.",
      users,
      {
        page,
        limit,
        totalRecords,
        totalPages: Math.ceil(totalRecords / limit),
      }
    );

  } catch (error) {
    console.error("Get Users Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};
// =========================
// Get Logged In User Profile
// =========================
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) {
      return responseHandler(
        res,
        404,
        false,
        "User not found."
      );
    }

    return responseHandler(
      res,
      200,
      true,
      "Profile fetched successfully.",
      user
    );
  } catch (error) {
    console.error("Get Profile Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};
// =========================
// Get User By ID
// =========================
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== id
    ) {
      return responseHandler(
        res,
        403,
        false,
        "Access denied."
      );
    }

    const user = await User.findById(id).select("-password");

    if (!user) {
      return responseHandler(
        res,
        404,
        false,
        "User not found."
      );
    }

    return responseHandler(
      res,
      200,
      true,
      "User fetched successfully.",
      user
    );
  } catch (error) {
    console.error("Get User By ID Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};
// =========================
// Delete User
// =========================
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // User can delete only themselves
    // Admin can delete anyone
    if (
      req.user.role !== "admin" &&
      req.user._id.toString() !== id
    ) {
      return responseHandler(
        res,
        403,
        false,
        "Access denied."
      );
    }

    const user = await User.findById(id);

    if (!user) {
      return responseHandler(
        res,
        404,
        false,
        "User not found."
      );
    }

    // Delete profile image from Cloudinary
    if (user.profile_image?.public_id) {
      await deleteImage(user.profile_image.public_id);
    }

    await User.findByIdAndDelete(id);

    return responseHandler(
      res,
      200,
      true,
      "User deleted successfully."
    );

  } catch (error) {
    console.error("Delete User Error:", error);

    return responseHandler(
      res,
      500,
      false,
      "Internal Server Error"
    );
  }
};