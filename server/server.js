require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes — harus sebelum static
app.use('/api/auth', require('./routes/auth'));
app.use('/api/news', require('./routes/news'));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '..')));

// Koneksi MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB terhubung');
    app.listen(process.env.PORT, () =>
      console.log(`🚀 Server berjalan di http://localhost:${process.env.PORT}`)
    );
  })
  .catch(err => console.error('❌ MongoDB gagal terhubung:', err.message));
