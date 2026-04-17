const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('../server/routes/auth'));
app.use('/api/news', require('../server/routes/news'));

// Debug endpoint — hapus setelah confirmed working
app.get('/api/ping', (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState,
    hasUri: !!process.env.MONGODB_URI
  });
});

// MongoDB connection (cached untuk serverless)
let isConnected = false;
async function connectDB() {
  if (isConnected && mongoose.connection.readyState === 1) return;
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000
  });
  isConnected = true;
}

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
  app(req, res);
};
