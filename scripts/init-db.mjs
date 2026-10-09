import mysql from "mysql2/promise";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";

const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = parseInt(process.env.DB_PORT || "3306", 10);
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "";
const DB_NAME = process.env.DB_NAME || "genomed_db";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@genomedpharmaceuticals.com";
const ADMIN_PASSWORD = process.env.ADMIN_INITIAL_PASSWORD || "Genomed@Admin2026";

const PRODUCT_SLUGS = [
  "decoliv-ds-syrup",
  "rimcuff-sf-syrup",
  "sugar-ok-liquid",
  "stoclean-sf-syrup",
  "kcr-powder",
  "cistover-liquid",
  "qsb-capsules",
  "heamclear-sf-syrup",
  "stroperm-powder",
  "arq-15",
];

async function initDb() {
  console.log(`Connecting to MySQL at ${DB_HOST}:${DB_PORT} as ${DB_USER}...`);

  // Step 1: Connect to server without database to create DB if missing
  const serverConn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
  });

  await serverConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
  console.log(`✓ Database '${DB_NAME}' ensured.`);
  await serverConn.end();

  // Step 2: Connect to the specific database
  const dbConn = await mysql.createConnection({
    host: DB_HOST,
    port: DB_PORT,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
    multipleStatements: true,
  });

  // Step 3: Run schema.sql
  const schemaSql = fs.readFileSync(path.join(process.cwd(), "db/schema.sql"), "utf-8");
  await dbConn.query(schemaSql);
  console.log("✓ All 7 database tables created successfully.");

  // Step 4: Seed Initial Stock for all 10 products
  for (const slug of PRODUCT_SLUGS) {
    await dbConn.query(
      `INSERT INTO stock (slug, qty_available) VALUES (?, 100) ON DUPLICATE KEY UPDATE qty_available = qty_available;`,
      [slug]
    );
  }
  console.log(`✓ Seeded stock levels for all ${PRODUCT_SLUGS.length} formulations.`);

  // Step 5: Seed Admin User
  const [existingUser] = await dbConn.query("SELECT id FROM users WHERE email = ?", [ADMIN_EMAIL]);
  if (Array.isArray(existingUser) && existingUser.length === 0) {
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    await dbConn.query(
      "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, 'Genomed Admin', 'admin')",
      [ADMIN_EMAIL, passwordHash]
    );
    console.log(`✓ Admin user created: ${ADMIN_EMAIL} (password: ${ADMIN_PASSWORD})`);
  } else {
    console.log(`- Admin user already exists: ${ADMIN_EMAIL}`);
  }

  await dbConn.end();
  console.log("\nDatabase initialization complete!");
}

initDb().catch((err) => {
  console.error("Database initialization failed:", err.message);
  process.exit(1);
});
