require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function setup() {
  const uri = process.env.MONGODB_URI;
  console.log('\n🔧 Threekini — Setup Database');
  console.log('================================');
  console.log(`📡 Menghubungkan ke: ${uri.replace(/:([^@]+)@/, ':****@')}`);

  await mongoose.connect(uri);
  console.log('✅ MongoDB terhubung\n');

  // Buat akun admin
  const existing = await User.findOne({ username: 'admin' });
  if (existing) {
    console.log('ℹ️  Akun admin sudah ada.');
    console.log('   Jika lupa password, hapus dokumen user di MongoDB lalu jalankan setup lagi.\n');
  } else {
    await User.create({
      username: 'admin',
      email: 'admin@threekini.com',
      password: 'Threekini@2026',
      role: 'admin'
    });
    console.log('✅ Akun admin berhasil dibuat!');
    console.log('   Username : admin');
    console.log('   Password : Threekini@2026');
    console.log('   ⚠️  Segera ganti password setelah login pertama!\n');
  }

  // Info collections
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`📦 Collections: ${collections.map(c => c.name).join(', ') || '(kosong)'}`);
  console.log('\n✅ Setup selesai!');
  console.log('   Jalankan server: npm run dev');
  console.log('   Buka admin    : http://localhost:5000/admin/login.html\n');

  await mongoose.disconnect();
}

setup().catch(err => {
  console.error('\n❌ Setup gagal:', err.message);
  if (err.message.includes('ECONNREFUSED')) {
    console.error('   MongoDB lokal tidak berjalan. Pastikan MongoDB aktif atau gunakan MongoDB Atlas.');
    console.error('   Update MONGODB_URI di file .env dengan connection string Atlas.\n');
  }
  process.exit(1);
});
