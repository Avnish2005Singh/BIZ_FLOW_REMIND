const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  phone: { type: String, required: true },
  company: { type: String },
  gstNumber: { type: String },
  address: { type: String },
  totalDue: { type: Number, default: 0 },
  totalPaid: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
