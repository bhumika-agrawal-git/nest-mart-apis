import Joi from "joi";

export const brandValidation = Joi.object({
  brand_name: Joi.string()
    .trim()
    .min(2)
    .max(50)
    .required()
    .messages({
      "string.empty": "Brand name is required",
      "string.min": "Brand name must be at least 2 characters",
      "string.max": "Brand name cannot exceed 50 characters",
    }),

  image: Joi.string().allow("", null),

  status: Joi.boolean(),
});