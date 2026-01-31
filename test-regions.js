const { Pool } = require('pg');

const projectRef = 'xqwbvlpavnagiuyyanbw';
const password = 'bVXdki6X8uODeVf4';

const regions = [
  'us-east-1',
  'us-west-1',
  'us-west-2',
  'eu-west-1',
  'eu-central-1',
  'ap-southeast-1',
  'ap-northeast-1',
  'ap-south-1',
];

async function testRegion(region) {
  const connectionString = `postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:5432/postgres`;

  const pool = new Pool({ connectionString, connectionTimeoutMillis: 5000 });

  try {
    const client = await pool.connect();
    console.log(`✅ SUCCESS - Region: ${region}`);
    const result = await client.query('SELECT NOW()');
    console.log('   Database time:', result.rows[0].now);
    client.release();
    await pool.end();
    return true;
  } catch (err) {
    console.log(`❌ FAILED - Region: ${region} - ${err.message}`);
    await pool.end();
    return false;
  }
}

async function findRegion() {
  console.log('Testing regions...\n');

  for (const region of regions) {
    const success = await testRegion(region);
    if (success) {
      console.log(`\n🎉 Found working region: ${region}`);
      console.log(`Connection string: postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:5432/postgres`);
      return;
    }
  }

  console.log('\n❌ No working region found');
}

findRegion();
