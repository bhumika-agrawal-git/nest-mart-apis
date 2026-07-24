import Joi from "joi";

export const categoryValidation = Joi.object({
  category_name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "Category name is required",
      "string.min": "Category name must be at least 2 characters",
    }),

  image: Joi.string().allow("", null),

  status: Joi.boolean(),
});