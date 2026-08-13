import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: ".env.local",
});

/*
 * =========================================================
 * DATABASE CONFIG
 * =========================================================
 */

const {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_NAME,
} = process.env;

if (
  !DB_HOST ||
  !DB_USER ||
  !DB_PASSWORD ||
  !DB_NAME
) {
  console.error(
    "Missing database environment variables.",
  );

  process.exit(1);
}

/*
 * =========================================================
 * SSL
 * =========================================================
 */

const caPath = path.join(
  process.cwd(),
  "certs",
  "ca.pem",
);

const ssl = fs.existsSync(caPath)
  ? {
      ca: fs.readFileSync(caPath),
      rejectUnauthorized: true,
    }
  : undefined;

/*
 * =========================================================
 * MIGRATION
 * =========================================================
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

        port: Number(
          DB_PORT || 3306,
        ),

        user: DB_USER,

        password: DB_PASSWORD,

        database: DB_NAME,

        ssl,

        multipleStatements: true,
      });

    console.log(
      "Database connected.",
    );

    /*
     * =====================================
     * LOAD SQL
     * =====================================
     */

    const migrationPath =
      path.join(
        process.cwd(),
        "database",
        "migrations",
        "007-audition-decimal-scores.sql",
      );

    const sql =
      fs.readFileSync(
        migrationPath,
        "utf8",
      );

    console.log(
      "Running decimal score migration...",
    );

    await connection.query(sql);

    console.log(
      "Decimal score migration completed successfully.",
    );

    /*
     * =====================================
     * VERIFY COLUMNS
     * =====================================
     */

    const [columns] =
      await connection.query(`
        SHOW COLUMNS
        FROM audition_evaluations
      `);

    const scoreColumns = [
      "technical_skill",
      "rhythm_timing",
      "creativity",
      "stage_presence",
      "overall_performance",
    ];

    console.log(
      "\nScore column verification:",
    );

    for (const column of columns) {
      if (
        scoreColumns.includes(
          column.Field,
        )
      ) {
        console.log(
          `${column.Field}: ${column.Type}`,
        );
      }
    }
  } catch (error) {
    console.error(
      "Migration failed:",
      error,
    );

    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();

      console.log(
        "\nDatabase connection closed.",
      );
    }
  }
}

runMigration();