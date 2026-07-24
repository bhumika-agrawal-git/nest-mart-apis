import Joi from "joi";

export const registerValidation = Joi.object({
  first_name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "First name is required",
      "string.min": "First name must be at least 2 characters",
      "any.required": "First name is required",
    }),

  last_name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "Last name is required",
      "string.min": "Last name must be at least 2 characters",
      "any.required": "Last name is required",
    }),
  phone_no: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .required(),
    
    role: Joi.string()
  .valid("user", "admin")
  .default("user"),


  email: Joi.string()
    .trim()
    .email()
    .required()
    .messages({
      "string.email": "Please enter a valid email",
      "string.empty": "Email is required",
      "any.required": "Email is required",
    }),

  gender: Joi.string()
    .valid("Male", "Female", "Other")
    .required()
    .messages({
      "any.only": "Gender must be Male, Female, or Other",
      "any.required": "Gender is required",
    }),

  password: Joi.string()
    .min(6)
    .max(20)
    .required()
    .messages({
      "string.min": "Password must be at least 6 characters",
      "string.max": "Password cannot exceed 20 characters",
      "string.empty": "Password is required",
      "any.required": "Password is required",
    }),

  confirm_password: Joi.string()
    .valid(Joi.ref("password"))
    .required()
    .messages({
      "any.only": "Confirm password must match password",
      "string.empty": "Confirm password is required",
      "any.required": "Confirm password is required",
    }),
});