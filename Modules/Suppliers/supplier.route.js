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

// READ (ADMIN + WAREHOUSE + ACCOUNTANT)
router.get('/', authorizeRoles('ADMIN', 'WAREHOUSE' , 'ACCOUNTANT'), getAllSuppliers);
router.get(
  '/:id',
  authorizeRoles('ADMIN', 'WAREHOUSE' , 'ACCOUNTANT'),
  validate(supplierIdSchema, 'params', idParamsOptions),
  getSupplierById
);

// WRITE (ADMIN + ACCOUNTANT only can create and update)
router.post('/', authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(createSupplierValidation), createSupplier);
router.put(
  '/:id',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
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

