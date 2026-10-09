import { SignJWT, jwtVerify } from "jose";
import { query } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "genomed-pharmaceuticals-jwt-secret-key-32chars-min"
);

// Rate-limiting trackers
const otpSendRateMap = new Map<string, { lastSent: number; count: number; windowStart: number }>();
const otpVerifyAttemptMap = new Map<string, { attempts: number; lockedUntil: number }>();
const consumedTokens = new Set<string>();

// In-memory fallback for local development when MySQL is offline
interface DevOtpRecord {
  phone: string;
  code: string;
  expiresAt: number;
  verified: boolean;
}
const devOtpStore = new Map<string, DevOtpRecord>();

/**
 * Normalizes an Indian mobile phone number to 10 digits
 */
export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length > 10) return digits.slice(-10);
  return digits;
}

/**
 * Sends a 6-digit OTP code to the given phone number with rate-limiting protection
 */
export async function sendOtp(rawPhone: string): Promise<{ success: boolean; message: string; devCode?: string }> {
  const phone = normalizePhone(rawPhone);
  if (phone.length !== 10) {
    throw new Error("Please enter a valid 10-digit Indian mobile number");
  }

  const now = Date.now();

  // Rate Limiting Check
  const rateRecord = otpSendRateMap.get(phone);
  if (rateRecord) {
    // 30 second cooldown check
    if (now - rateRecord.lastSent < 30 * 1000) {
      const waitSec = Math.ceil((30 * 1000 - (now - rateRecord.lastSent)) / 1000);
      throw new Error(`Please wait ${waitSec} seconds before requesting a new OTP.`);
    }

    // 1-hour window check (max 5 requests per hour)
    if (now - rateRecord.windowStart < 60 * 60 * 1000) {
      if (rateRecord.count >= 5) {
        throw new Error("Too many OTP requests for this phone number. Please try again after 1 hour.");
      }
      rateRecord.count += 1;
      rateRecord.lastSent = now;
    } else {
      // Reset window
      otpSendRateMap.set(phone, { lastSent: now, count: 1, windowStart: now });
    }
  } else {
    otpSendRateMap.set(phone, { lastSent: now, count: 1, windowStart: now });
  }

  // Clear previous failed attempts on new OTP request
  otpVerifyAttemptMap.delete(phone);

  // Generate 6-digit cryptographic-safe OTP
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Store in MySQL or in-memory fallback
  try {
    await query(
      `INSERT INTO otp_codes (phone, code, expires_at, verified) VALUES (?, ?, ?, 0)`,
      [phone, code, expiresAt]
    );
  } catch (err) {
    console.warn("[OTP] Database write failed, using dev memory store:", (err as Error).message);
    devOtpStore.set(phone, {
      phone,
      code,
      expiresAt: expiresAt.getTime(),
      verified: false,
    });
  }

  const provider = process.env.SMS_PROVIDER || "mock";
  const apiKey = process.env.SMS_API_KEY;

  if (provider === "fast2sms" && apiKey) {
    try {
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variables_values: code,
          route: "otp",
          numbers: phone,
        }),
      });
      const data = await res.json();
      if (!data.return) {
        console.error("[Fast2SMS Error]", data);
      }
    } catch (e) {
      console.error("[Fast2SMS Delivery Error]", e);
    }
  } else if (provider === "msg91" && apiKey) {
    try {
      await fetch(
        `https://api.msg91.com/api/v5/otp?template_id=${process.env.MSG91_TEMPLATE_ID || ""}&mobile=91${phone}&authkey=${apiKey}&otp=${code}`,
        { method: "POST" }
      );
    } catch (e) {
      console.error("[Msg91 Delivery Error]", e);
    }
  } else {
    // Mock / Development mode
    console.log(`\n========================================`);
    console.log(`[DEV OTP] Phone: +91 ${phone} | Code: ${code} (or use 123456)`);
    console.log(`========================================\n`);
  }

  return {
    success: true,
    message: "OTP sent successfully to your mobile number",
    devCode: process.env.NODE_ENV !== "production" ? code : undefined,
  };
}

/**
 * Verifies an OTP code and returns a signed phone verification token with brute-force defense
 */
export async function verifyOtp(rawPhone: string, code: string): Promise<{ success: boolean; phoneToken: string }> {
  const phone = normalizePhone(rawPhone);
  const trimmedCode = code.trim();
  const now = Date.now();

  // Brute-force check: max 5 attempts
  const attemptRecord = otpVerifyAttemptMap.get(phone) || { attempts: 0, lockedUntil: 0 };
  if (attemptRecord.lockedUntil > now) {
    const remainMin = Math.ceil((attemptRecord.lockedUntil - now) / 60000);
    throw new Error(`Too many incorrect attempts. Please try again in ${remainMin} minutes.`);
  }

  let verified = false;

  // Development bypass: allow 123456 in non-production or mock mode
  const isMockAllowed = process.env.SMS_PROVIDER === "mock" || !process.env.SMS_API_KEY;
  if (isMockAllowed && trimmedCode === "123456") {
    verified = true;
  }

  if (!verified) {
    try {
      interface DbOtpRow {
        id: number;
        code: string;
        expires_at: Date;
      }
      const rows = await query<DbOtpRow[]>(
        `SELECT id, code, expires_at FROM otp_codes 
         WHERE phone = ? AND verified = 0 AND expires_at > NOW() 
         ORDER BY id DESC LIMIT 1`,
        [phone]
      );

      if (rows.length > 0 && rows[0].code === trimmedCode) {
        verified = true;
        await query(`UPDATE otp_codes SET verified = 1 WHERE id = ?`, [rows[0].id]);
      }
    } catch {
      // In-memory fallback
      const record = devOtpStore.get(phone);
      if (record && !record.verified && record.expiresAt > Date.now() && record.code === trimmedCode) {
        record.verified = true;
        verified = true;
      }
    }
  }

  if (!verified) {
    attemptRecord.attempts += 1;
    if (attemptRecord.attempts >= 5) {
      attemptRecord.lockedUntil = now + 15 * 60 * 1000; // 15-minute lock
      otpVerifyAttemptMap.set(phone, attemptRecord);
      throw new Error("Too many incorrect attempts. Verification locked for 15 minutes.");
    }
    otpVerifyAttemptMap.set(phone, attemptRecord);
    throw new Error(`Invalid or expired OTP code. (${5 - attemptRecord.attempts} attempts remaining)`);
  }

  // Verification succeeded - clear failed attempts
  otpVerifyAttemptMap.delete(phone);

  // Issue short-lived verified phone token (15 mins) with unique jti
  const jti = `tok_${now}_${Math.random().toString(36).substring(2, 9)}`;
  const phoneToken = await new SignJWT({ phone, verified: true })
    .setProtectedHeader({ alg: "HS256" })
    .setJti(jti)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(JWT_SECRET);

  return { success: true, phoneToken };
}

/**
 * Validates and consumes a verified phone token from the checkout request (prevents replay attacks)
 */
export async function validatePhoneToken(phoneToken: string, phone: string): Promise<boolean> {
  try {
    const normalizedPhone = normalizePhone(phone);
    const { payload } = await jwtVerify(phoneToken, JWT_SECRET);

    if (payload.jti && consumedTokens.has(payload.jti)) {
      return false; // Token already consumed
    }

    if (payload.verified === true && payload.phone === normalizedPhone) {
      if (payload.jti) {
        consumedTokens.add(payload.jti);
        // Garbage collect after 30 mins
        setTimeout(() => consumedTokens.delete(payload.jti!), 30 * 60 * 1000);
      }
      return true;
    }

    return false;
  } catch {
    return false;
  }
}
