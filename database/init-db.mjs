import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const caPath = path.join(
  process.cwd(),
  process.env.DB_CA_CERT_PATH || "certs/ca.pem"
);

const schemaPath = path.join(process.cwd(), "database/schema.sql");
const seedPath = path.join(process.cwd(), "database/seed.sql");

const schemaSql = fs.readFileSync(schemaPath, "utf8");
const seedSql = fs.readFileSync(seedPath, "utf8");

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
  console.log("Connecting to Aiven MySQL...");

  await db.query(schemaSql);
  console.log("✅ Database schema created successfully");

  await db.query(seedSql);
  console.log("✅ Default data inserted successfully");

  console.log("✅ Database initialization complete");
} catch (error) {
  console.error("❌ Database initialization failed:");
  console.error(error);
} finally {
  await db.end();
}