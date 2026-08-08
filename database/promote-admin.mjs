import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";

const email = process.argv[2];

if (!email) {
  console.error("❌ Please provide an email address.");
  console.log(
    "Example: node --env-file=.env.local database/promote-admin.mjs admin@example.com"
  );
  process.exit(1);
}

const caPath = path.join(
  process.cwd(),
  process.env.DB_CA_CERT_PATH || "certs/ca.pem"
);

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
});

try {
  console.log("Connecting to database...");

  const [roles] = await db.execute(
    `
      SELECT id
      FROM roles
      WHERE name = 'ADMIN'
      LIMIT 1
    `
  );

  if (roles.length === 0) {
    throw new Error("ADMIN role does not exist.");
  }

  const [users] = await db.execute(
    `
      SELECT
        id,
        full_name,
        email
      FROM users
      WHERE email = ?
      LIMIT 1
    `,
    [email.trim().toLowerCase()]
  );

  if (users.length === 0) {
    console.error("❌ No account found with this email.");
    process.exit(1);
  }

  await db.execute(
    `
      UPDATE users
      SET role_id = ?
      WHERE id = ?
    `,
    [
      roles[0].id,
      users[0].id,
    ]
  );

  console.log(
    `✅ ${users[0].full_name} (${users[0].email}) is now an ADMIN`
  );
} catch (error) {
  console.error("❌ Admin promotion failed:");
  console.error(error);
} finally {
  await db.end();
}