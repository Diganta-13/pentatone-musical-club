import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error("❌ Please provide a migration file.");
  process.exit(1);
}

const caPath = path.join(
  process.cwd(),
  process.env.DB_CA_CERT_PATH || "certs/ca.pem"
);

const migrationPath = path.join(process.cwd(), migrationFile);

const migrationSql = fs.readFileSync(migrationPath, "utf8");

const db = await mysql.createConnection({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  ssl: {
    ca: fs.readFileSync(caPath),
    rejectUnauthorized: true,
  },

  multipleStatements: true,
});

try {
  console.log(`Running migration: ${migrationFile}`);

  await db.query(migrationSql);

  console.log("✅ Migration completed successfully");
} catch (error) {
  console.error("❌ Migration failed:");
  console.error(error);
} finally {
  await db.end();
}