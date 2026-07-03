const { neon } = require('@neondatabase/serverless');

const DATABASE_URL = 'postgresql://neondb_owner:npg_nTAuw09pLXRx@ep-wandering-bonus-acj4zwvo-pooler.sa-east-1.aws.neon.tech/gestao-saude?sslmode=require&channel_binding=require';
const sql = neon(DATABASE_URL);

async function run() {
  try {
    await sql`INSERT INTO users (id, email, name) VALUES ('mock-user', 'mock@test.com', 'Mock User') ON CONFLICT (id) DO NOTHING`;
    console.log("Mock user inserted");
  } catch (err) {
    console.error(err);
  }
}

run();
