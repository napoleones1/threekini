const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('../server/routes/auth'));
app.use('/api/news', require('../server/routes/news'));

app.get('/api/ping', async (req, res) => {
  res.json({
    status: 'ok',
    mongo: mongoose.connection.readyState,
    hasUri: !!process.env.MONGODB_URI
  });
});

async function connectDB() {
  // Sudah connected
  if (mongoose.connection.readyState === 1) return;

  // Reset koneksi lama yang tidak ready
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }

  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 20000,
    maxPoolSize: 10,
    bufferCommands: true,
  });
}

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    console.error('DB connect error:', err.message);
    return res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
  app(req, res);
};
