const mongoose = require('mongoose');
const Order = require('./order.Model');
const Inventory = require('../Inventory/inventory.Model');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function buildStockMap(stockRows) {
  const map = new Map();
  stockRows.forEach((row) => {
    map.set(String(row.productId), row.stock || 0);
  });
  return map;
}

async function createOrder(req, res) {
  try {
    const { customerName, items } = req.body;

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const order = await Order.create({
      customerName,
      items,
      status: 'PENDING',
      totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    console.error('[order.createOrder] error', { message: error.message });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }
}

async function getAllOrders(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const skip = (page - 1) * limit;

    // Keep any future/optional filter logic intact by building on a single filters object.
    const filters = {};

    const orders = await Order.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Order.countDocuments(filters);

    return res.status(200).json({
      success: true,
      message: 'Orders fetched successfully',
      data: orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[order.getAllOrders] error', { message: error.message });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }
}

async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order id',
        data: null,
      });
    }

    const order = await Order.findById(id).lean();
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Order fetched successfully',
      data: order,
    });
  } catch (error) {
    console.error('[order.getOrderById] error', { message: error.message });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }
}

async function confirmOrder(req, res) {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order id',
        data: null,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null,
      });
    }

    if (order.status === 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'Order already confirmed',
        data: null,
      });
    }

    const orderItems = Array.isArray(order.items) ? order.items : [];
    const productIdStrings = [];
    for (const item of orderItems) {
      const normalizedProductId = String(item.productId);
      if (!isValidObjectId(normalizedProductId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product id',
          data: null,
        });
      }
      productIdStrings.push(normalizedProductId);
    }

    const productObjectIds = [...new Set(productIdStrings)].map((productId) => new mongoose.Types.ObjectId(productId));

    const stockRows = await Inventory.aggregate([
      {
        $match: {
          productId: { $in: productObjectIds },
        },
      },
      {
        $group: {
          _id: '$productId',
          stock: {
            $sum: {
              $switch: {
                branches: [
                  { case: { $eq: ['$type', 'IN'] }, then: '$quantity' },
                  { case: { $eq: ['$type', 'OUT'] }, then: { $multiply: ['$quantity', -1] } },
                ],
                default: 0,
              },
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          productId: { $toString: '$_id' },
          stock: 1,
        },
      },
    ]);

    const stockMap = buildStockMap(stockRows);

    for (const item of orderItems) {
      const productId = String(item.productId);
      const availableStock = stockMap.get(productId) || 0;

      if (availableStock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient stock',
          data: {
            productId,
            requested: item.quantity,
            available: availableStock,
          },
        });
      }
    }

    session.startTransaction();

    const logs = orderItems.map((item) => ({
      productId: item.productId,
      type: 'OUT',
      quantity: item.quantity,
      source: 'ORDER',
      referenceId: order._id,
    }));

    await Inventory.insertMany(logs, { session });
    order.status = 'CONFIRMED';
    await order.save({ session });

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: 'Order confirmed successfully',
      data: order,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error('[order.confirmOrder] error', { message: error.message });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  } finally {
    session.endSession();
  }
}

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  confirmOrder,
};
