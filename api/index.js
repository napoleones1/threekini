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

let connectionPromise = null;

async function connectDB() {
  // Kalau sudah connected, langsung return
  if (mongoose.connection.readyState === 1) return;

  // Kalau sedang proses connect, tunggu promise yang sama
  if (connectionPromise) return connectionPromise;

  connectionPromise = mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 15000,
    socketTimeoutMS: 30000,
    maxPoolSize: 10,
  }).then(() => {
    connectionPromise = null;
  }).catch(err => {
    connectionPromise = null;
    throw err;
  });

  return connectionPromise;
}

module.exports = async (req, res) => {
  try {
    await connectDB();
    // Pastikan benar-benar ready
    if (mongoose.connection.readyState !== 1) {
      throw new Error('MongoDB not ready, state: ' + mongoose.connection.readyState);
    }
  } catch (err) {
    return res.status(500).json({ message: 'Database connection failed', error: err.message });
  }
  return app(req, res);
};
