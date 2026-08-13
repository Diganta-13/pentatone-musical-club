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
 * VALIDATE ENVIRONMENT VARIABLES
 * =====================================
 */

const missingVariables = [];

if (!DB_HOST) {
  missingVariables.push(
    "DB_HOST",
  );
}

if (!DB_PORT) {
  missingVariables.push(
    "DB_PORT",
  );
}

if (!DB_USER) {
  missingVariables.push(
    "DB_USER",
  );
}

if (!DB_PASSWORD) {
  missingVariables.push(
    "DB_PASSWORD",
  );
}

if (!DB_NAME) {
  missingVariables.push(
    "DB_NAME",
  );
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
    "006-auditions.sql",
  );

const caPath =
  path.join(
    process.cwd(),
    "certs",
    "ca.pem",
  );

/*
 * =====================================
 * CHECK MIGRATION FILE
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

/*
 * =====================================
 * CHECK SSL CERTIFICATE
 * =====================================
 */

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
    /*
     * =====================================
     * CONNECT
     * =====================================
     */

    console.log(
      "Connecting to database...",
    );

    connection =
      await mysql.createConnection({
        host:
          DB_HOST,

        port:
          Number(
            DB_PORT,
          ),

        user:
          DB_USER,

        password:
          DB_PASSWORD,

        database:
          DB_NAME,

        ssl: {
          ca,
        },

        /*
         * Required because
         * 006-auditions.sql contains
         * multiple CREATE TABLE statements.
         */
        multipleStatements:
          true,
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
      "Running auditions migration...",
    );

    await connection.query(
      migrationSQL,
    );

    console.log(
      "Auditions migration completed successfully.",
    );

    /*
     * =====================================
     * VERIFY audition_sessions
     * =====================================
     */

    const [
      sessionTables,
    ] =
      await connection.query(
        `
          SHOW TABLES
          LIKE 'audition_sessions'
        `,
      );

    if (
      Array.isArray(
        sessionTables,
      ) &&
      sessionTables.length > 0
    ) {
      console.log(
        "Verified table: audition_sessions",
      );
    } else {
      console.warn(
        "Warning: audition_sessions table was not found.",
      );
    }

    /*
     * =====================================
     * VERIFY audition_applications
     * =====================================
     */

    const [
      applicationTables,
    ] =
      await connection.query(
        `
          SHOW TABLES
          LIKE 'audition_applications'
        `,
      );

    if (
      Array.isArray(
        applicationTables,
      ) &&
      applicationTables.length > 0
    ) {
      console.log(
        "Verified table: audition_applications",
      );
    } else {
      console.warn(
        "Warning: audition_applications table was not found.",
      );
    }

    /*
     * =====================================
     * VERIFY audition_evaluations
     * =====================================
     */

    const [
      evaluationTables,
    ] =
      await connection.query(
        `
          SHOW TABLES
          LIKE 'audition_evaluations'
        `,
      );

    if (
      Array.isArray(
        evaluationTables,
      ) &&
      evaluationTables.length > 0
    ) {
      console.log(
        "Verified table: audition_evaluations",
      );
    } else {
      console.warn(
        "Warning: audition_evaluations table was not found.",
      );
    }

    /*
     * =====================================
     * COMPLETE
     * =====================================
     */

    console.log(
      "Auditions database setup verified.",
    );
  } catch (error) {
    console.error(
      "Auditions migration failed.",
    );

    console.error(
      error,
    );

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