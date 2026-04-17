const express = require('express');
const router = express.Router();
const verifyToken = require('../../Middleware/VerfiyToken');
const { login, getMe } = require('./Auth.controller');

console.log('Auth.routes.js: login type =', typeof login);
console.log('Auth.routes.js: router type =', typeof router);

if (typeof login !== 'function') {
  throw new Error(
    'Auth.routes.js: login handler must be a function. Check Auth.controller.js export.'
  );
}

router.post('/login', login);
router.get('/me', verifyToken, getMe); // GET /api/auth/me

module.exports = router;