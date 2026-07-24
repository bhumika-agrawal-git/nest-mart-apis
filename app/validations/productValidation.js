import Joi from "joi";

export const productValidation = Joi.object({
  product_name: Joi.string().trim().required(),

  category_id: Joi.string().required(),

  brand_id: Joi.string().required(),

  description: Joi.string().allow("", null),

  price: Joi.number().positive().required(),

  discount_price: Joi.number().min(0).default(0),

  quantity: Joi.number().min(0).required(),

  unit: Joi.string()
    .valid("kg", "gm", "ltr", "ml", "pcs", "pack")
    .required(),

  image: Joi.string().allow("", null),

  status: Joi.boolean(),
});