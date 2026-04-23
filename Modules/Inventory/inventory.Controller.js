const mongoose = require('mongoose');
const Inventory = require('./inventory.Model');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

function invalidProductIdResponse(res) {
  return res.status(400).json({ success: false, message: 'Invalid product id' });
}

async function getAllLogs(req, res) {
  try {
    const logs = await Inventory.find().sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('[inventory.getAllLogs] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getLogsByProduct(req, res) {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return invalidProductIdResponse(res);
    }

    const logs = await Inventory.find({ productId }).sort({ createdAt: -1 }).lean();
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('[inventory.getLogsByProduct] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getProductStock(req, res) {
  try {
    const { productId } = req.params;

    if (!isValidObjectId(productId)) {
      return invalidProductIdResponse(res);
    }

    const [stockResult] = await Inventory.aggregate([
      { $match: { productId: new mongoose.Types.ObjectId(productId) } },
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

    return res.status(200).json({
      success: true,
      data: {
        productId,
        stock: stockResult ? stockResult.stock : 0,
      },
    });
  } catch (error) {
    console.error('[inventory.getProductStock] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  getAllLogs,
  getLogsByProduct,
  getProductStock,
};
