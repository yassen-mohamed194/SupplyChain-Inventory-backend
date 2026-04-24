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

router.get('/', authorizeRoles('ADMIN', 'WAREHOUSE' , 'ACCOUNTANT'), getAllLogs);
router.get('/stock/:productId', authorizeRoles('ADMIN', 'WAREHOUSE' , 'ACCOUNTANT'), getProductStock);
router.get('/:productId', authorizeRoles('ADMIN', 'WAREHOUSE' , 'ACCOUNTANT'), getLogsByProduct);

module.exports = router;
