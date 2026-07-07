import postgres from 'postgres';
import fs from 'fs';

// Read from .dev.vars
const envContent = fs.readFileSync('.dev.vars', 'utf-8');
const match = envContent.match(/DATABASE_URL="([^"]+)"/);
const databaseUrl = match ? match[1] : null;

if (!databaseUrl) {
  console.error("DATABASE_URL not found in .dev.vars");
  process.exit(1);
}

const sql = postgres(databaseUrl);

try {
  const users = await sql`SELECT id, email, name FROM users`;
  console.log("Users in DB:");
  console.log(users);
  
  const records = await sql`SELECT DISTINCT user_id, arquivo_origem FROM medical_records`;
  console.log("\nDistinct user_id and archivo_origem in medical_records:");
  console.log(records);

  const count = await sql`SELECT COUNT(*), user_id, arquivo_origem FROM medical_records GROUP BY user_id, arquivo_origem`;
  console.log("\nCount of medical_records by user and archivo_origem:");
  console.log(count);
} catch (err) {
  console.error(err);
} finally {
  await sql.end();
}
