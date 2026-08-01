const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['payment', 'inventory', 'meeting', 'custom'],
    default: 'custom'
  },
  date: { type: Date, required: true },
  time: { type: String, default: '12:00' },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high'], 
    default: 'medium' 
  },
  completed: { type: Boolean, default: false },
  notes: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Reminder', reminderSchema);
