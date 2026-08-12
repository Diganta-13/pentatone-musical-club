import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

async function runMigration() {
  let connection;

  try {
    console.log("Connecting to Aiven MySQL...");

    const caPath = path.join(
      process.cwd(),
      process.env.DB_CA_CERT_PATH || "certs/ca.pem"
    );

    connection = await mysql.createConnection({
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

    console.log("Database connected.");

    const migrationPath = path.join(
      process.cwd(),
      "database",
      "migrations",
      "003-gallery.sql"
    );

    const sql = fs.readFileSync(
      migrationPath,
      "utf8"
    );

    console.log(
      "Running gallery migration..."
    );

    await connection.query(sql);

    console.log(
      "Gallery migration completed successfully."
    );

    const [tables] =
      await connection.query(`
        SHOW TABLES
        LIKE 'gallery_%'
      `);

    console.log(
      "Gallery tables:"
    );

    console.table(tables);
  } catch (error) {
    console.error(
      "Migration failed:"
    );

    console.error(error);

    process.exitCode = 1;
  } finally {
    if (connection) {
      await connection.end();

      console.log(
        "Database connection closed."
      );
    }
  }
}

runMigration();