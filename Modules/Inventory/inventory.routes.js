const express = require('express');
const router = express.Router();
const verifyToken = require('../../Middleware/VerifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');

const {
  getAllLogs,
  getLogsByProduct,
  getProductStock,
} = require('./inventory.Controller');

router.use(verifyToken);

router.get('/', authorizeRoles('ADMIN', 'WAREHOUSE'), getAllLogs);
router.get('/stock/:productId', authorizeRoles('ADMIN', 'WAREHOUSE'), getProductStock);
router.get('/:productId', authorizeRoles('ADMIN', 'WAREHOUSE'), getLogsByProduct);

module.exports = router;
