const { z } = require('zod');
const mongoose = require('mongoose');

const objectIdParam = z
  .string()
  .trim()
  .refine((val) => mongoose.Types.ObjectId.isValid(val), { message: 'Invalid supplier id' });

const createSupplierValidation = z
  .object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters'),
    phone: z.string().trim().min(1, 'Phone is required'),
    address: z.string().trim().min(1, 'Address is required'),
  })
  .strict();

const updateSupplierValidation = z
  .object({
    name: z.string().trim().min(3, 'Name must be at least 3 characters').optional(),
    phone: z.string().trim().min(1).optional(),
    address: z.string().trim().min(1).optional(),
  })
  .strict();

const supplierIdSchema = z
  .object({
    id: objectIdParam,
  })
  .strict();

module.exports = {
  createSupplierValidation,
  updateSupplierValidation,
  supplierIdSchema,
};
