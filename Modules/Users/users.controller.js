const User = require('./users.model');

function safeUserProjection() {
  return { name: 1, email: 1, role: 1, createdAt: 1, updatedAt: 1 };
}

async function createUser(req, res) {
  try {
    const payload = req.body;
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
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    const data = await User.find()
      .select(safeUserProjection())
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments();

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[users.getAllUsers] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;

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
    const updates = { ...req.body };
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
