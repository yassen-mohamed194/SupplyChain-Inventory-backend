const { z } = require('zod');
const mongoose = require('mongoose');

const objectIdString = (message) =>
  z
    .string()
    .trim()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), { message });

const createOrderValidation = z
  .object({
    customerName: z.string().trim().min(1, 'Customer name is required'),
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

const orderIdSchema = z
  .object({
    id: objectIdString('Invalid order id'),
  })
  .strict();

module.exports = {
  createOrderValidation,
  orderIdSchema,
};
