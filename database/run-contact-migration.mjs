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

const missingVariables = [];

if (!DB_HOST) missingVariables.push("DB_HOST");
if (!DB_PORT) missingVariables.push("DB_PORT");
if (!DB_USER) missingVariables.push("DB_USER");
if (!DB_PASSWORD) missingVariables.push("DB_PASSWORD");
if (!DB_NAME) missingVariables.push("DB_NAME");

if (missingVariables.length > 0) {
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

const migrationPath = path.join(
  process.cwd(),
  "database",
  "migrations",
  "010-contact-messages.sql",
);

const caPath = path.join(
  process.cwd(),
  "certs",
  "ca.pem",
);

/*
 * =====================================
 * CHECK REQUIRED FILES
 * =====================================
 */

if (!fs.existsSync(migrationPath)) {
  console.error(
    "Migration file not found:",
    migrationPath,
  );

  process.exit(1);
}

if (!fs.existsSync(caPath)) {
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

const migrationSQL = fs.readFileSync(
  migrationPath,
  "utf8",
);

const ca = fs.readFileSync(
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
      "Connecting to Aiven database...",
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
      "Database connected successfully.",
    );

    console.log(
      "Running contact messages migration...",
    );

    await connection.query(
      migrationSQL,
    );

    console.log(
      "Contact messages migration completed successfully.",
    );

    /*
     * =====================================
     * VERIFY TABLE
     * =====================================
     */

    const [tables] =
      await connection.query(`
        SHOW TABLES
        LIKE 'contact_messages'
      `);

    if (
      Array.isArray(tables) &&
      tables.length > 0
    ) {
      console.log(
        "Verified table: contact_messages ✅",
      );

      /*
       * =====================================
       * VERIFY COLUMNS
       * =====================================
       */

      const [columns] =
        await connection.query(
          "DESCRIBE contact_messages",
        );

      console.log(
        "Contact messages table columns:",
      );

      console.table(columns);
    } else {
      console.warn(
        "Migration ran, but contact_messages table was not found.",
      );
    }
  } catch (error) {
    console.error(
      "Contact messages migration failed.",
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

runMigration();