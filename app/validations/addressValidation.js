import Joi from "joi";

export const addressValidation = Joi.object({
  full_name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      "string.empty": "Full name is required.",
      "any.required": "Full name is required.",
    }),

  phone_no: Joi.string()
    .pattern(/^[6-9]\d{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be a valid 10-digit Indian mobile number.",
      "string.empty": "Phone number is required.",
      "any.required": "Phone number is required.",
    }),

  address_line_1: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "Address Line 1 is required.",
      "any.required": "Address Line 1 is required.",
    }),

  address_line_2: Joi.string()
    .trim()
    .allow("", null),

  landmark: Joi.string()
    .trim()
    .allow("", null),

  city: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "City is required.",
      "any.required": "City is required.",
    }),

  state: Joi.string()
    .trim()
    .required()
    .messages({
      "string.empty": "State is required.",
      "any.required": "State is required.",
    }),

  country: Joi.string()
    .trim()
    .default("India"),

  pincode: Joi.string()
    .pattern(/^[1-9][0-9]{5}$/)
    .required()
    .messages({
      "string.pattern.base": "Pincode must be a valid 6-digit Indian pincode.",
      "string.empty": "Pincode is required.",
      "any.required": "Pincode is required.",
    }),

  tag: Joi.string()
    .valid("Home", "Work", "Other")
    .default("Home")
    .messages({
      "any.only": "Tag must be Home, Work or Other.",
    }),

  is_default: Joi.boolean().default(false),
});