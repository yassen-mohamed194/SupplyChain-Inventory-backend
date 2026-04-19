const Product = require('./Product.Model');

function productProjection() {
  return { name: 1, sku: 1, price: 1, createdAt: 1, updatedAt: 1 };
}

function normalizeSku(value) {
  return String(value).trim().toUpperCase();
}

function isMongoDuplicateKeyError(error) {
  return Boolean(error && error.code === 11000);
}

function duplicateSkuResponse() {
  return { success: false, message: 'SKU already exists' };
}

async function createProduct(req, res) {
  try {
    const payload = req.body;
    const sku = normalizeSku(payload.sku);

    const existing = await Product.findOne({ sku }).select('_id').lean();
    if (existing) {
      return res.status(409).json(duplicateSkuResponse());
    }

    const created = await Product.create({
      name: payload.name,
      sku,
      price: payload.price,
    });

    const data = await Product.findById(created._id).select(productProjection()).lean();

    return res.status(201).json({
      success: true,
      message: 'Product created',
      data,
    });
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      return res.status(409).json(duplicateSkuResponse());
    }
    console.error('[products.createProduct] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getAllProducts(req, res) {
  try {
    const products = await Product.find()
      .select(productProjection())
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('[products.getAllProducts] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getProductById(req, res) {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).select(productProjection()).lean();
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('[products.getProductById] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (Object.prototype.hasOwnProperty.call(updates, 'sku')) {
      updates.sku = normalizeSku(updates.sku);
      const skuOwner = await Product.findOne({ sku: updates.sku }).select('_id').lean();
      if (skuOwner && String(skuOwner._id) !== String(id)) {
        return res.status(409).json(duplicateSkuResponse());
      }
    }

    const updated = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    })
      .select(productProjection())
      .lean();

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Product updated',
      data: updated,
    });
  } catch (error) {
    if (isMongoDuplicateKeyError(error)) {
      return res.status(409).json(duplicateSkuResponse());
    }
    console.error('[products.updateProduct] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    const deleted = await Product.findByIdAndDelete(id).lean();
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted',
    });
  } catch (error) {
    console.error('[products.deleteProduct] error', { message: error.message });
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};
