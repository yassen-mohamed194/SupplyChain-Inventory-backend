const express = require('express');
const router = express.Router();
const verifyToken = require('../../Middleware/VerfiyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');

const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('./users.controller');

// ADMIN-only user management
router.use(verifyToken, authorizeRoles('ADMIN'));

router.post('/', createUser);
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;