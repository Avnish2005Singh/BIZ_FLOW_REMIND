const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  sku: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String },
  quantity: { type: Number, default: 0, min: 0 },
  minStockLevel: { type: Number, default: 10 },
  costPrice: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  supplier: {
    name: { type: String },
    contact: { type: String }
  },
  location: { type: String },
  status: { 
    type: String, 
    enum: ['in-stock', 'low-stock', 'out-of-stock'], 
    default: 'in-stock' 
  }
}, { timestamps: true });

// Auto-update status before saving
inventorySchema.pre('save', function(next) {
  if (this.quantity === 0) {
    this.status = 'out-of-stock';
  } else if (this.quantity <= this.minStockLevel) {
    this.status = 'low-stock';
  } else {
    this.status = 'in-stock';
  }
  next();
});

module.exports = mongoose.model('Inventory', inventorySchema);
