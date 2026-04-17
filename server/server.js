require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();
const ROOT = path.join(__dirname, '..');

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/news', require('./routes/news'));

// Static (untuk lokal)
app.use('/uploads', express.static(path.join(ROOT, 'uploads')));
app.use(express.static(ROOT));

// Fallback HTML
app.get('*', (req, res) => {
  const file = req.path === '/' ? 'index.html' : req.path.replace(/^\//, '');
  const fullPath = path.join(ROOT, file);
  res.sendFile(fullPath, err => {
    if (err) res.sendFile(path.join(ROOT, 'index.html'));
  });
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB terhubung');
    const port = process.env.PORT || 5000;
    app.listen(port, () => console.log(`🚀 Server berjalan di http://localhost:${port}`));
  })
  .catch(err => console.error('❌ MongoDB gagal terhubung:', err.message));

module.exports = app;
