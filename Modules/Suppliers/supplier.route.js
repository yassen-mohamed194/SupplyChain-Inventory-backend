const express = require('express');
const router = express.Router();

const verifyToken = require('../../Middleware/VerifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');
const validate = require('../../Middleware/validate');

const {
  createSupplierValidation,
  updateSupplierValidation,
  supplierIdSchema,
} = require('../../Middleware/validations/supplier.validation');

const {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} = require('./supplier.controller');

const idParamsOptions = { invalidParamsMessage: 'Invalid supplier id' };

router.use(verifyToken);

// READ (ADMIN + WAREHOUSE)
router.get('/', authorizeRoles('ADMIN', 'WAREHOUSE'), getAllSuppliers);
router.get(
  '/:id',
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  validate(supplierIdSchema, 'params', idParamsOptions),
  getSupplierById
);

// WRITE (ADMIN only)
router.post('/', authorizeRoles('ADMIN'), validate(createSupplierValidation), createSupplier);
router.put(
  '/:id',
  authorizeRoles('ADMIN'),
  validate(supplierIdSchema, 'params', idParamsOptions),
  validate(updateSupplierValidation),
  updateSupplier
);
router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  validate(supplierIdSchema, 'params', idParamsOptions),
  deleteSupplier
);

module.exports = router;

