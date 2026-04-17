const User = require('../Users/users.model');
const generateToken = require('./utils/genrateToken');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const getMe = async (req, res) => {
  try {
    const userId = req.user && req.user.sub;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await User.findById(userId)
      .select('-password')
      .select('name email role -_id')
      .lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('[auth.getMe] error', { message: error && error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken({
      _id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    });
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
      },
    });
  } catch (error) {
    console.error('Auth.controller.js login error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

module.exports = { login, getMe };
