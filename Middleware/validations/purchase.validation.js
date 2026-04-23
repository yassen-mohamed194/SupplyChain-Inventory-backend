const { z } = require('zod');
const mongoose = require('mongoose');

const objectIdString = (message) =>
  z
    .string()
    .trim()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), { message });

const createPurchaseValidation = z
  .object({
    supplierId: objectIdString('Invalid supplier id'),
    items: z
      .array(
        z
          .object({
            productId: objectIdString('Invalid product id'),
            quantity: z.number().finite('Quantity must be a valid number').gt(0, 'Quantity must be greater than 0'),
            price: z.number().finite('Price must be a valid number').gt(0, 'Price must be greater than 0'),
          })
          .strict()
      )
      .min(1, 'Items must contain at least one product'),
  })
  .strict();

const updateStatusValidation = z
  .object({
    status: z
      .string()
      .trim()
      .transform((val) => val.toUpperCase())
      .refine((val) => ['PENDING', 'RECEIVED'].includes(val), {
        message: 'Invalid status',
      }),
  })
  .strict();

const purchaseIdSchema = z
  .object({
    id: objectIdString('Invalid purchase id'),
  })
  .strict();

module.exports = {
  createPurchaseValidation,
  updateStatusValidation,
  purchaseIdSchema,
};
