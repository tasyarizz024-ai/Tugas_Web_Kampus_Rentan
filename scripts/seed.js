const { initDb } = require('../lib/db');

async function runSeed() {
  console.log('--- Inisialisasi & Seeding Database Portal Kampus ---');
  try {
    await initDb();
    console.log('[OK] Database berhasil diinisialisasi dan data awal (seed) berhasil dimasukkan!');
    process.exit(0);
  } catch (err) {
    console.error('[ERROR] Gagal inisialisasi database:', err);
    process.exit(1);
  }
}

runSeed();
