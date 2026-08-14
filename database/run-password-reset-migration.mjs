import fs from "fs";
import path from "path";

import mysql from "mysql2/promise";

/*
 * =====================================
 * ENV
 * =====================================
 */

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
  DB_CA_CERT_PATH,
} = process.env;

if (
  !DB_HOST ||
  !DB_PORT ||
  !DB_USER ||
  !DB_PASSWORD ||
  !DB_NAME
) {
  throw new Error(
    "Missing database environment variables.",
  );
}

/*
 * =====================================
 * SSL CERT
 * =====================================
 */

const caPath = path.resolve(
  process.cwd(),
  DB_CA_CERT_PATH ||
    "certs/ca.pem",
);

const ca = fs.readFileSync(
  caPath,
  "utf8",
);

/*
 * =====================================
 * MIGRATION FILE
 * =====================================
 */

const migrationPath =
  path.resolve(
    process.cwd(),
    "database",
    "migrations",
    "011-password-reset.sql",
  );

const sql =
  fs.readFileSync(
    migrationPath,
    "utf8",
  );

/*
 * =====================================
 * RUN
 * =====================================
 */

let connection;

try {
  console.log(
    "Connecting to database...",
  );

  connection =
    await mysql.createConnection({
      host: DB_HOST,
      port: Number(DB_PORT),
      user: DB_USER,
      password: DB_PASSWORD,
      database: DB_NAME,

      ssl: {
        ca,
      },

      multipleStatements: true,
    });

  console.log(
    "Running password reset migration...",
  );

  await connection.query(sql);

  console.log(
    "✅ Password reset migration completed.",
  );

  /*
   * VERIFY TABLE
   */

  const [tables] =
    await connection.query(
      `
        SHOW TABLES
        LIKE 'password_reset_tokens'
      `,
    );

  console.log(
    "Table check:",
    tables,
  );

  const [columns] =
    await connection.query(
      `
        DESCRIBE password_reset_tokens
      `,
    );

  console.table(columns);
} catch (error) {
  console.error(
    "❌ Migration failed:",
    error,
  );

  process.exitCode = 1;
} finally {
  if (connection) {
    await connection.end();
  }
}