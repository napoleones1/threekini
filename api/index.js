const mongoose = require('mongoose');

let app = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close();
  }
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 20000,
    socketTimeoutMS: 45000,
    connectTimeoutMS: 20000,
    maxPoolSize: 10,
  });
}

function createApp() {
  if (app) return app;
  const express = require('express');
  const cors = require('cors');
  app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/api/auth', require('../server/routes/auth'));
  app.use('/api/news', require('../server/routes/news'));
  app.use('/rss.xml', require('../server/routes/rss'));
  app.get('/api/ping', (req, res) => {
    res.json({ status: 'ok', mongo: mongoose.connection.readyState });
  });
  return app;
}

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    return res.status(500).json({ message: 'DB failed: ' + err.message });
  }
  createApp()(req, res);
};
