const User = require('./users.model');

async function getAllUsers(req, res) {
  try {
    const users = await User.find().select('-password').lean();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
}

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    const user = await User.findById(id).select('-password').lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch user' });
  }
}

async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email, and password are required' });
    }

    const existing = await User.findOne({ email }).lean();
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const user = await User.create({ name, email, password, role });
    const safe = user.toObject();
    delete safe.password;
    return res.status(201).json(safe);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to create user' });
  }
}

async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...(req.body || {}) };

    // Avoid accidentally blanking/rehashing password via this endpoint.
    if ('password' in updates) delete updates.password;

    const user = await User.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .select('-password')
      .lean();

    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to update user' });
  }
}

async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id).select('-password').lean();
    if (!deleted) return res.status(404).json({ error: 'User not found' });
    return res.status(200).json({ message: 'User deleted' });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to delete user' });
  }
}

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
