require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

async function setup() {
  console.log('\n🔧 Threekini — Setup Database');
  console.log('================================');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB terhubung\n');

  // Buat superadmin
  const superadmin = await User.findOne({ role: 'superadmin' });
  if (superadmin) {
    console.log('ℹ️  Akun superadmin sudah ada:', superadmin.username);
  } else {
    await User.create({
      username: 'superadmin',
      email: 'superadmin@threekini.com',
      password: 'Threekini@Super2026',
      role: 'superadmin'
    });
    console.log('✅ Akun superadmin dibuat!');
    console.log('   Username : superadmin');
    console.log('   Password : Threekini@Super2026');
  }

  // Buat admin biasa
  const admin = await User.findOne({ username: 'admin' });
  if (admin) {
    console.log('ℹ️  Akun admin sudah ada.');
  } else {
    await User.create({
      username: 'admin',
      email: 'admin@threekini.com',
      password: 'Threekini@2026',
      role: 'admin'
    });
    console.log('✅ Akun admin dibuat!');
    console.log('   Username : admin');
    console.log('   Password : Threekini@2026');
  }

  console.log('\n⚠️  Segera ganti password setelah login pertama!');
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`📦 Collections: ${collections.map(c => c.name).join(', ')}`);
  console.log('\n✅ Setup selesai!\n');
  await mongoose.disconnect();
}

setup().catch(err => {
  console.error('\n❌ Setup gagal:', err.message);
  process.exit(1);
});
