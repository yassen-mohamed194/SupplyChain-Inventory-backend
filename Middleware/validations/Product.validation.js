const { z } = require('zod');
const mongoose = require('mongoose');

const objectIdParam = z
  .string()
  .trim()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Invalid product id' });

const createProductValidation = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    sku: z.string().trim().min(1, 'SKU is required'),
    price: z.number().finite('Price must be a valid number').gt(0, 'Price must be greater than 0'),
  })
  .strict();

const updateProductValidation = z
  .object({
    name: z.string().trim().min(1).optional(),
    sku: z.string().trim().min(1).optional(),
    price: z.number().finite('Price must be a valid number').gt(0, 'Price must be greater than 0').optional(),
  })
  .strict();

const productIdSchema = z
  .object({
    id: objectIdParam,
  })
  .strict();

module.exports = {
  createProductValidation,
  updateProductValidation,
  productIdSchema,
};
