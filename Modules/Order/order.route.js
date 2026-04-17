const express = require('express');
const router = express.Router();

const { listOrders } = require('./order.controller');

router.get('/', listOrders);

module.exports = router;
