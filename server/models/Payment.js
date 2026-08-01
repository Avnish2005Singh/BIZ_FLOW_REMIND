const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['incoming', 'outgoing'], 
    required: true 
  },
  customer: { type: String, required: true },
  amount: { type: Number, required: true },
  method: { 
    type: String, 
    enum: ['Cash', 'UPI', 'Card', 'Bank Transfer', 'Cheque', 'Other'],
    default: 'Cash'
  },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    default: 'completed' 
  },
  category: { type: String },
  description: { type: String },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
