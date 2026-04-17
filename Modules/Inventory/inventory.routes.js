const express = require('express');
const router = express.Router();

const { listInventory } = require('./inventory.Controller');

router.get('/', listInventory);

module.exports = router;
