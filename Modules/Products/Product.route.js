const express = require('express');
const router = express.Router();
const verifyToken = require('../../Middleware/VerifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');
const validate = require('../../Middleware/validate');
const {
  createProductValidation,
  updateProductValidation,
  productIdSchema,
} = require('../../Middleware/validations/Product.validation');
const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require('./Product.controller');

const idParamsOptions = { invalidParamsMessage: 'Invalid product id' };

router.use(verifyToken);

router.post(
  '/',
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  validate(createProductValidation),
  createProduct
);
router.get('/', authorizeRoles('ADMIN', 'WAREHOUSE'), getAllProducts);
router.get(
  '/:id',
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  validate(productIdSchema, 'params', idParamsOptions),
  getProductById
);
router.put(
  '/:id',
  authorizeRoles('ADMIN', 'WAREHOUSE'),
  validate(productIdSchema, 'params', idParamsOptions),
  validate(updateProductValidation),
  updateProduct
);
router.delete(
  '/:id',
  authorizeRoles('ADMIN'),
  validate(productIdSchema, 'params', idParamsOptions),
  deleteProduct
);

module.exports = router;
