import fs from "fs";
import path from "path";

import mysql, {
  type Pool,
} from "mysql2/promise";

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

if (
  !DB_HOST ||
  !DB_PORT ||
  !DB_USER ||
  !DB_PASSWORD ||
  !DB_NAME
) {
  throw new Error(
    "Missing required database environment variables.",
  );
}

/*
 * =====================================
 * SSL CERTIFICATE
 * =====================================
 */

const caPath = path.join(
  process.cwd(),
  "certs",
  "ca.pem",
);

if (!fs.existsSync(caPath)) {
  throw new Error(
    `Database CA certificate not found: ${caPath}`,
  );
}

const ca = fs.readFileSync(
  caPath,
  "utf8",
);

/*
 * =====================================
 * GLOBAL POOL
 *
 * Prevent multiple pools during
 * Next.js development hot reload.
 * =====================================
 */

declare global {
  var mysqlPool:
    | Pool
    | undefined;
}

/*
 * =====================================
 * CREATE / REUSE POOL
 * =====================================
 */

const db =
  global.mysqlPool ??
  mysql.createPool({
    host: DB_HOST,

    port: Number(
      DB_PORT,
    ),

    user: DB_USER,

    password:
      DB_PASSWORD,

    database:
      DB_NAME,

    ssl: {
      ca,
    },

    /*
     * IMPORTANT:
     * Keep this low for Aiven.
     */

    connectionLimit: 5,

    waitForConnections: true,

    queueLimit: 0,

    enableKeepAlive: true,

    keepAliveInitialDelay: 0,
  });

/*
 * =====================================
 * SAVE POOL DURING DEVELOPMENT
 * =====================================
 */

if (
  process.env.NODE_ENV !==
  "production"
) {
  global.mysqlPool = db;
}

export default db;