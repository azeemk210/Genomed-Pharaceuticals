import mysql from "mysql2/promise";

declare global {
  var __mysqlPool: mysql.Pool | undefined;
}

/**
 * Returns a singleton connection pool for MySQL.
 * Cached on globalThis to prevent multiple connection pools during Next.js hot-reloading.
 */
export function getDbPool(): mysql.Pool {
  if (globalThis.__mysqlPool) {
    return globalThis.__mysqlPool;
  }

  const host = process.env.DB_HOST || "localhost";
  const port = parseInt(process.env.DB_PORT || "3306", 10);
  const user = process.env.DB_USER || "root";
  const password = process.env.DB_PASSWORD || "";
  const database = process.env.DB_NAME || "genomed_db";
  const connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT || "10", 10);

  const pool = mysql.createPool({
    host,
    port,
    user,
    password,
    database,
    waitForConnections: true,
    connectionLimit,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 2000,
  });

  if (process.env.NODE_ENV !== "production") {
    globalThis.__mysqlPool = pool;
  }

  return pool;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function query<T = unknown>(sql: string, params: any[] = []): Promise<T> {
  const pool = getDbPool();
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

/**
 * Executes a callback inside an atomic MySQL transaction.
 * Automatically commits on success, rollbacks on error.
 */
export async function withTransaction<T>(
  callback: (connection: mysql.PoolConnection) => Promise<T>,
): Promise<T> {
  const pool = getDbPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * Check if the database connection can be established.
 */
export async function pingDb(): Promise<boolean> {
  try {
    const pool = getDbPool();
    await pool.query("SELECT 1");
    return true;
  } catch {
    return false;
  }
}
