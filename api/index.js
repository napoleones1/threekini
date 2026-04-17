const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', require('../server/routes/auth'));
app.use('/api/news', require('../server/routes/news'));

app.get('/api/ping', (req, res) => {
  res.json({ status: 'ok', mongo: mongoose.connection.readyState, hasUri: !!process.env.MONGODB_URI });
});

// Koneksi MongoDB — tidak di-cache agar selalu fresh di serverless
async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState === 2) {
    // Sedang connecting, tunggu
    await new Promise(resolve => mongoose.connection.once('connected', resolve));
    return;
  }
  // Disconnect dulu kalau ada koneksi lama yang stuck
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 30000,
    maxPoolSize: 1,
    minPoolSize: 0,
    maxIdleTimeMS: 10000,
    bufferCommands: false
  });
}

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
  app(req, res);
};
