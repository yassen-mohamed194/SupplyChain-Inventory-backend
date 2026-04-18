const { z } = require('zod');

const ROLES = ['ADMIN', 'ACCOUNTANT', 'WAREHOUSE', 'USER'];

const createUserSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    email: z.string().trim().email('Invalid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    role: z.enum(ROLES).optional(),
  })
  .strict();

const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).optional(),
    email: z.string().trim().email().optional(),
    role: z.enum(ROLES).optional(),
  })
  .strict();

const userIdSchema = z
  .object({
    id: z.string().length(24, 'Invalid ObjectId'),
  })
  .strict();

const blockPasswordUpdate = (req, res, next) => {
  if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'password')) {
    return res.status(400).json({
      success: false,
      message: 'Password cannot be updated using this endpoint',
    });
  }
  next();
};

module.exports = {
  ROLES,
  createUserSchema,
  updateUserSchema,
  userIdSchema,
  blockPasswordUpdate,
};
