const express = require('express');
const router = express.Router();
const { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser, 
  createUser 
} = require('./users.controller');

console.log('users.routes.js: router type =', typeof router);

// Define routes
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

// Export the router directly (not as an object)
module.exports = router;