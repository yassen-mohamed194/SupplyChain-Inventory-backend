const User = require('../Users/users.model');
const generateToken = require('./utils/genrateToken');
const bcrypt = require('bcryptjs');

const getMe = async (req, res) => {
  return res.status(200).json({ success: true, data: req.user });
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: String(email).toLowerCase().trim() });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({
      _id: user._id,
      role: user.role,
      email: user.email,
      name: user.name,
    });
    return res.status(200).json({ 
      message: 'Login successful',
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Auth.controller.js login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

console.log('Auth.controller.js: login type =', typeof login);

module.exports = { login, getMe };