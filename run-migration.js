const { Pool } = require('pg');
const fs = require('fs');
require('dotenv/config');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  try {
    const sql = fs.readFileSync('migration.sql', 'utf8');

    console.log('🚀 Running migration...\n');

    const client = await pool.connect();
    await client.query(sql);
    client.release();

    console.log('✅ Migration completed successfully!\n');
    console.log('Tables created:');
    console.log('  - Agent');
    console.log('  - Submolt');
    console.log('  - Post');
    console.log('  - Comment');

    await pool.end();
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

runMigration();
