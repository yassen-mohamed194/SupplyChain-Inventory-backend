const mongoose = require('mongoose');
const Purchase = require('./Purchase.model');
const Inventory = require('../Inventory/inventory.Model');

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

async function createPurchase(req, res) {
  try {
    const { supplierId, items } = req.body;

    const totalAmount = items.reduce((sum, item) => sum + item.quantity * item.price, 0);

    const purchase = await Purchase.create({
      supplierId,
      items,
      status: 'PENDING',
      totalAmount,
    });

    return res.status(201).json({
      success: true,
      message: 'Purchase created successfully',
      data: purchase,
    });
  } catch (error) {
    console.error('[purchase.createPurchase] error', { message: error.message });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }
}

async function getAllPurchases(req, res) {
  try {
    const purchases = await Purchase.find().sort({ createdAt: -1 }).lean();

    return res.status(200).json({
      success: true,
      message: 'Purchases fetched successfully',
      data: purchases,
    });
  } catch (error) {
    console.error('[purchase.getAllPurchases] error', { message: error.message });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }
}

async function getPurchaseById(req, res) {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase id',
        data: null,
      });
    }

    const purchase = await Purchase.findById(id).lean();
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Purchase fetched successfully',
      data: purchase,
    });
  } catch (error) {
    console.error('[purchase.getPurchaseById] error', { message: error.message });
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      data: null,
    });
  }
}

async function updatePurchaseStatus(req, res) {
  const session = await mongoose.startSession();

  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid purchase id',
        data: null,
      });
    }

    const purchase = await Purchase.findById(id);
    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: 'Purchase not found',
        data: null,
      });
    }

    if (purchase.status === 'RECEIVED') {
      return res.status(400).json({
        success: false,
        message: 'Purchase already marked as RECEIVED',
        data: null,
      });
    }

    session.startTransaction();

    purchase.status = status;
    await purchase.save({ session });

    if (status === 'RECEIVED') {
      const logs = purchase.items.map((item) => ({
        productId: item.productId,
        type: 'IN',
        quantity: item.quantity,
        source: 'PURCHASE',
        referenceId: purchase._id,
      }));

      await Inventory.insertMany(logs, { session });
    }

    await session.commitTransaction();

    return res.status(200).json({
      success: true,
      message: 'Purchase status updated successfully',
      data: purchase,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }

    console.error('[purchase.updatePurchaseStatus] error', { message: error.message });
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
  createPurchase,
  getAllPurchases,
  getPurchaseById,
  updatePurchaseStatus,
};
