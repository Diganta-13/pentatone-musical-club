import fs from "fs";
import path from "path";

import mysql from "mysql2/promise";

/*
 * =====================================
 * LOAD ENVIRONMENT VARIABLES
 * =====================================
 */

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

/*
 * =====================================
 * VALIDATE ENV
 * =====================================
 */

const missingVariables = [];

if (!DB_HOST) {
  missingVariables.push("DB_HOST");
}

if (!DB_PORT) {
  missingVariables.push("DB_PORT");
}

if (!DB_USER) {
  missingVariables.push("DB_USER");
}

if (!DB_PASSWORD) {
  missingVariables.push(
    "DB_PASSWORD",
  );
}

if (!DB_NAME) {
  missingVariables.push("DB_NAME");
}

if (
  missingVariables.length > 0
) {
  console.error(
    "Missing environment variables:",
    missingVariables.join(", "),
  );

  process.exit(1);
}

/*
 * =====================================
 * PATHS
 * =====================================
 */

const migrationPath =
  path.join(
    process.cwd(),
    "database",
    "migrations",
    "004-events.sql",
  );

const caPath =
  path.join(
    process.cwd(),
    "certs",
    "ca.pem",
  );

/*
 * =====================================
 * CHECK FILES
 * =====================================
 */

if (
  !fs.existsSync(
    migrationPath,
  )
) {
  console.error(
    "Migration file not found:",
    migrationPath,
  );

  process.exit(1);
}

if (
  !fs.existsSync(caPath)
) {
  console.error(
    "SSL certificate not found:",
    caPath,
  );

  process.exit(1);
}

/*
 * =====================================
 * READ FILES
 * =====================================
 */

const migrationSQL =
  fs.readFileSync(
    migrationPath,
    "utf8",
  );

const ca =
  fs.readFileSync(
    caPath,
    "utf8",
  );

/*
 * =====================================
 * RUN MIGRATION
 * =====================================
 */

async function runMigration() {
  let connection;

  try {
    console.log(
      "Connecting to database...",
    );

    connection =
      await mysql.createConnection({
        host: DB_HOST,

        port:
          Number(DB_PORT),

        user: DB_USER,

        password:
          DB_PASSWORD,

        database:
          DB_NAME,

        ssl: {
          ca,
        },

        multipleStatements: true,
      });

    console.log(
      "Database connected.",
    );

    console.log(
      "Running events migration...",
    );

    await connection.query(
      migrationSQL,
    );

    console.log(
      "Events migration completed successfully.",
    );

    /*
     * =====================================
     * VERIFY TABLE
     * =====================================
     */

    const [tables] =
      await connection.query(
        `
          SHOW TABLES
          LIKE 'events'
        `,
      );

    if (
      Array.isArray(tables) &&
      tables.length > 0
    ) {
      console.log(
        "Verified table: events",
      );
    } else {
      console.warn(
        "Migration ran, but events table was not found.",
      );
    }
  } catch (error) {
    console.error(
      "Events migration failed.",
    );

    console.error(error);

    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();

      console.log(
        "Database connection closed.",
      );
    }
  }
}

/*
 * =====================================
 * START
 * =====================================
 */

runMigration();