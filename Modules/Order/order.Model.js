const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
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

const orderSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (value) => Array.isArray(value) && value.length > 0,
        message: 'At least one order item is required',
      },
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED'],
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

orderSchema.pre('save', function () {
  this.totalAmount = this.items.reduce((sum, item) => sum + item.quantity * item.price, 0);
});

module.exports = mongoose.model('Order', orderSchema);
