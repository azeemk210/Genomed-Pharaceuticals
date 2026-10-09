import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { query } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "genomed-pharmaceuticals-jwt-secret-key-32chars-min"
);

export const ADMIN_COOKIE_NAME = "genomed_admin_session";

// Brute-force login defense
const loginAttemptMap = new Map<string, { attempts: number; lockedUntil: number }>();

export interface AdminPayload {
  email: string;
  name: string;
  role: string;
}

export function checkAdminLockout(email: string): void {
  const record = loginAttemptMap.get(email.toLowerCase());
  if (record && record.lockedUntil > Date.now()) {
    const remainMin = Math.ceil((record.lockedUntil - Date.now()) / 60000);
    throw new Error(`Too many failed login attempts. Login temporarily locked for ${remainMin} minutes.`);
  }
}

export function recordFailedLogin(email: string): void {
  const key = email.toLowerCase();
  const record = loginAttemptMap.get(key) || { attempts: 0, lockedUntil: 0 };
  record.attempts += 1;
  if (record.attempts >= 5) {
    record.lockedUntil = Date.now() + 15 * 60 * 1000; // 15-minute lock
  }
  loginAttemptMap.set(key, record);
}

export function recordSuccessfulLogin(email: string): void {
  loginAttemptMap.delete(email.toLowerCase());
}

/**
 * Validates admin credentials against users table or environment variables
 */
export async function authenticateAdmin(
  email: string,
  plainPassword: string
): Promise<{ success: boolean; user?: AdminPayload }> {
  const cleanEmail = email.trim().toLowerCase();

  // Check brute force lockout
  checkAdminLockout(cleanEmail);

  const defaultAdminEmail = (process.env.ADMIN_EMAIL || "admin@genomedpharmaceuticals.com").toLowerCase();
  const defaultAdminPassword = process.env.ADMIN_INITIAL_PASSWORD || "Genomed@Admin2026";

  // 1. Try MySQL database first
  try {
    interface DbUserRow {
      id: number;
      email: string;
      password_hash: string;
      name: string;
      role: string;
    }
    const rows = await query<DbUserRow[]>(
      `SELECT id, email, password_hash, name, role FROM users WHERE LOWER(email) = ? LIMIT 1`,
      [cleanEmail]
    );

    if (rows.length > 0) {
      const user = rows[0];
      const match = await bcrypt.compare(plainPassword, user.password_hash);
      if (match) {
        recordSuccessfulLogin(cleanEmail);
        return {
          success: true,
          user: {
            email: user.email,
            name: user.name,
            role: user.role,
          },
        };
      }
    }
  } catch (err) {
    console.warn("[Admin Auth] Database check failed, testing env fallback:", (err as Error).message);
  }

  // 2. Fallback to configured ADMIN_EMAIL & ADMIN_INITIAL_PASSWORD
  if (cleanEmail === defaultAdminEmail && plainPassword === defaultAdminPassword) {
    recordSuccessfulLogin(cleanEmail);
    return {
      success: true,
      user: {
        email: defaultAdminEmail,
        name: "Genomed Administrator",
        role: "admin",
      },
    };
  }

  // Record failed attempt
  recordFailedLogin(cleanEmail);
  return { success: false };
}

/**
 * Creates signed admin session token
 */
export async function createAdminToken(user: AdminPayload): Promise<string> {
  return await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

/**
 * Verifies admin session token
 */
export async function verifyAdminToken(token: string): Promise<AdminPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.role !== "admin") return null;
    return {
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as string,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves the currently logged in admin from Next.js cookies or request headers
 */
export async function getCurrentAdmin(req?: Request): Promise<AdminPayload | null> {
  let token: string | undefined;

  // 1. Try reading from Request Cookie header if passed
  if (req) {
    const cookieHeader = req.headers.get("cookie");
    if (cookieHeader) {
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${ADMIN_COOKIE_NAME}=([^;]+)`));
      if (match) token = match[1];
    }
  }

  // 2. Fallback to next/headers cookies() if in server request scope
  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
    } catch {
      // Outside Next.js request store context
    }
  }

  if (!token) return null;
  return verifyAdminToken(token);
}
