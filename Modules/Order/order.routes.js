const express = require('express');
const router = express.Router();

const verifyToken = require('../../Middleware/VerifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');
const validate = require('../../Middleware/validate');

const { createOrderValidation, orderIdSchema } = require('../../Middleware/validations/order.validation');

const { createOrder, getAllOrders, getOrderById, confirmOrder } = require('./order.controller');

const idParamsOptions = { invalidParamsMessage: 'Invalid order id' };

router.use(verifyToken);

router.post('/', authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(createOrderValidation), createOrder);

router.get('/', authorizeRoles('ADMIN', 'ACCOUNTANT'), getAllOrders);

router.get('/:id', authorizeRoles('ADMIN', 'ACCOUNTANT'), validate(orderIdSchema, 'params', idParamsOptions), getOrderById);

router.put(
  '/:id/confirm',
  authorizeRoles('ADMIN', 'ACCOUNTANT'),
  validate(orderIdSchema, 'params', idParamsOptions),
  confirmOrder
);

module.exports = router;
