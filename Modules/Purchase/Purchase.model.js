const mongoose = require('mongoose');

const purchaseItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    price: {
      type: Number,
      required: true,
      min: 0.01,
    },
  },
  { _id: false }
);

const purchaseSchema = new mongoose.Schema(
  {
    supplierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Supplier',
      required: true,
      index: true,
    },
    items: {
      type: [purchaseItemSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one purchase item is required',
      },
    },
    status: {
      type: String,
      enum: ['PENDING', 'RECEIVED'],
      default: 'PENDING',
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

purchaseSchema.pre('save', async function () {
  this.totalAmount = this.items.reduce((sum, item) => {
    return sum + item.quantity * item.price;
  }, 0);
}); 
module.exports = mongoose.model('Purchase', purchaseSchema);
