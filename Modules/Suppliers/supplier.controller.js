const Supplier = require('./supplier.model');

function supplierProjection() {
  return { name: 1, phone: 1, address: 1, createdAt: 1, updatedAt: 1 };
}

async function createSupplier(req, res) {
  try {
    const payload = req.body;

    const created = await Supplier.create({
      name: payload.name,
      phone: payload.phone,
      address: payload.address,
    });

    const data = await Supplier.findById(created._id).select(supplierProjection()).lean();

    return res.status(201).json({ success: true, data });
  } catch (error) {
    console.error('[suppliers.createSupplier] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getAllSuppliers(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    const data = await Supplier.find()
      .select(supplierProjection())
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Supplier.countDocuments();

    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[suppliers.getAllSuppliers] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getSupplierById(req, res) {
  try {
    const { id } = req.params;

    const supplier = await Supplier.findById(id).select(supplierProjection()).lean();
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    return res.status(200).json({ success: true, data: supplier });
  } catch (error) {
    console.error('[suppliers.getSupplierById] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function updateSupplier(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    const updated = await Supplier.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .select(supplierProjection())
      .lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    return res.status(200).json({ success: true, data: updated });
  } catch (error) {
    console.error('[suppliers.updateSupplier] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function deleteSupplier(req, res) {
  try {
    const { id } = req.params;

    const deleted = await Supplier.findByIdAndDelete(id).select('_id').lean();
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Supplier not found' });
    }

    return res.status(200).json({ success: true, data: deleted });
  } catch (error) {
    console.error('[suppliers.deleteSupplier] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
};

