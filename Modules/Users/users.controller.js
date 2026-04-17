const mongoose = require('mongoose');
const { z } = require('zod');
const User = require('./users.model');

const ROLES = ['ADMIN', 'ACCOUNTANT', 'WAREHOUSE', 'USER'];

const createUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  email: z.string().trim().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(ROLES).optional(),
});

const updateUserSchema = z.object({
  name: z.string().trim().min(1).optional(),
  email: z.string().trim().email().optional(),
  role: z.enum(ROLES).optional(),
});

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(String(id));
}

function safeUserProjection() {
  return { name: 1, email: 1, role: 1, createdAt: 1, updatedAt: 1 };
}

async function createUser(req, res) {
  try {
    const parsed = createUserSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        data: parsed.error.flatten(),
      });
    }

    const payload = parsed.data;
    const email = payload.email.toLowerCase();

    const existing = await User.findOne({ email }).lean();
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: 'Email already in use' });
    }

    const created = await User.create({ ...payload, email });
    const safe = await User.findById(created._id)
      .select(safeUserProjection())
      .lean();

    return res.status(201).json({
      success: true,
      message: 'User created',
      data: safe,
    });
  } catch (error) {
    console.error('[users.createUser] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getAllUsers(req, res) {
  try {
    const users = await User.find()
      .select(safeUserProjection())
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error('[users.getAllUsers] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const user = await User.findById(id).select(safeUserProjection()).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('[users.getUserById] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    // Explicitly block password updates on this endpoint
    if (req.body && Object.prototype.hasOwnProperty.call(req.body, 'password')) {
      return res.status(400).json({
        success: false,
        message: 'Password cannot be updated using this endpoint',
      });
    }

    const parsed = updateUserSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        data: parsed.error.flatten(),
      });
    }

    const updates = { ...parsed.data };
    if (updates.email) updates.email = updates.email.toLowerCase();

    if (updates.email) {
      const emailOwner = await User.findOne({ email: updates.email }).select('_id').lean();
      if (emailOwner && String(emailOwner._id) !== String(id)) {
        return res
          .status(409)
          .json({ success: false, message: 'Email already in use' });
      }
    }

    const updated = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .select(safeUserProjection())
      .lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'User updated',
      data: updated,
    });
  } catch (error) {
    console.error('[users.updateUser] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (!isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const deleted = await User.findByIdAndDelete(id).select('_id').lean();
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({ success: true, message: 'User deleted' });
  } catch (error) {
    console.error('[users.deleteUser] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
};
