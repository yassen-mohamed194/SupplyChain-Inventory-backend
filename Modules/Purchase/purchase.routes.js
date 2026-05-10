const express = require('express');
const router = express.Router();

const verifyToken = require('../../Middleware/VerifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');
const validate = require('../../Middleware/validate');

const {
  createPurchaseValidation,
  updateStatusValidation,
  purchaseIdSchema,
} = require('../../Middleware/validations/purchase.validation');

const {
  createPurchase,
  getAllPurchases,
  getPurchasesBySupplier,
  getPurchaseById,
  updatePurchaseStatus,
} = require('./Purchase.controller');

const idParamsOptions = { invalidParamsMessage: 'Invalid purchase id' };

router.use(verifyToken);

router.post(
  '/',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
  validate(createPurchaseValidation),
  createPurchase
);

router.get('/', authorizeRoles('ADMIN', 'ACCOUNTANT' , 'WAREHOUSE'), getAllPurchases);

router.get(
  '/supplier/:supplierId',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
  getPurchasesBySupplier
);

router.get(
  '/:id',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
  validate(purchaseIdSchema, 'params', idParamsOptions),
  getPurchaseById
);

router.put(
  '/:id/status',
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  validate(purchaseIdSchema, 'params', idParamsOptions),
  validate(updateStatusValidation, 'body'),
  updatePurchaseStatus
);

module.exports = router;
