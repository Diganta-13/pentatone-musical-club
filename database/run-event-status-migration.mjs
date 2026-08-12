import fs from "fs";
import path from "path";

import mysql from "mysql2/promise";

/*
 * =====================================
 * ENVIRONMENT VARIABLES
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
 * FILE PATHS
 * =====================================
 */

const migrationPath =
  path.join(
    process.cwd(),
    "database",
    "migrations",
    "005-event-status-override.sql",
  );

const caPath =
  path.join(
    process.cwd(),
    "certs",
    "ca.pem",
  );

/*
 * =====================================
 * CHECK REQUIRED FILES
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
  !fs.existsSync(
    caPath,
  )
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

    /*
     * =====================================
     * DATABASE CONNECTION
     * =====================================
     */

    connection =
      await mysql.createConnection({
        host: DB_HOST,

        port:
          Number(DB_PORT),

        user:
          DB_USER,

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

    /*
     * =====================================
     * RUN SQL
     * =====================================
     */

    console.log(
      "Running event status override migration...",
    );

    await connection.query(
      migrationSQL,
    );

    console.log(
      "Event status override migration completed successfully.",
    );

    /*
     * =====================================
     * VERIFY COLUMN
     * =====================================
     */

    const [columns] =
      await connection.query(
        `
          SHOW COLUMNS
          FROM events
          LIKE 'status_override'
        `,
      );

    if (
      Array.isArray(
        columns,
      ) &&
      columns.length > 0
    ) {
      console.log(
        "Verified column: status_override",
      );
    } else {
      console.warn(
        "Migration ran, but status_override column was not found.",
      );
    }

    /*
     * =====================================
     * VERIFY INDEX
     * =====================================
     */

    const [indexes] =
      await connection.query(
        `
          SHOW INDEX
          FROM events
          WHERE Key_name = 'idx_events_status_override'
        `,
      );

    if (
      Array.isArray(
        indexes,
      ) &&
      indexes.length > 0
    ) {
      console.log(
        "Verified index: idx_events_status_override",
      );
    } else {
      console.warn(
        "Migration ran, but idx_events_status_override was not found.",
      );
    }
  } catch (error) {
    console.error(
      "Event status override migration failed.",
    );

    console.error(error);

    process.exitCode = 1;
  } finally {
    /*
     * =====================================
     * CLOSE CONNECTION
     * =====================================
     */

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