const express = require('express');
const router = express.Router();

const verifyToken = require('../../Middleware/VerifyToken');
const authorizeRoles = require('../../Middleware/authorizeRoles');

const {
  getMonthlyPurchases,
  getMonthlyOrders,
  getTopProducts,
  getLowStockProducts,
  getFinanceSummary,
} = require('./dashboard.controller');

router.use(verifyToken);
router.use(authorizeRoles('ADMIN'));

router.get('/purchases/monthly', getMonthlyPurchases);
router.get('/orders/monthly', getMonthlyOrders);
router.get('/top-products', getTopProducts);
router.get('/low-stock', getLowStockProducts);
router.get('/finance/summary', getFinanceSummary);

module.exports = router;
