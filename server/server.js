require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const customerRoutes = require('./routes/customer.routes');
const paymentRoutes = require('./routes/payment.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const reminderRoutes = require('./routes/reminder.routes');

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'BizFlow API with MongoDB! 🚀' });
});

// API Routes
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reminders', reminderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
