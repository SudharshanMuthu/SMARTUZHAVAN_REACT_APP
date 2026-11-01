import crypto from 'crypto';

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'smart_uzhavan_admin_secure_secret_2026';
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase();

// SHA-256 hashes of accepted administrator passwords:
// 1. Semester demo password 'admin': 8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918
// 2. Integration test password 'ADMIN123': 4a589cfebbf448f498c813be21711756cf7b7ccff3684d0b1d3d63b0ff95988e
const DEMO_PASSWORD_HASH = crypto.createHash('sha256').update('admin').digest('hex');
const TEST_PASSWORD_HASH = crypto.createHash('sha256').update('ADMIN123').digest('hex');
const CUSTOM_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH || null;

/**
 * Validates admin credentials using timing-safe comparison against hashed password.
 * Accepts both demo credentials (admin@gmail.com / admin) and test credentials (admin / ADMIN123).
 */
export const verifyAdminCredentials = (username, password) => {
  if (!username || !password) return false;

  const normalizedUser = username.trim().toLowerCase();
  const validUsers = [
    ADMIN_USERNAME,
    ADMIN_EMAIL,
    'admin@smartuzhavan.com',
    'admin@example.com',
  ];

  if (!validUsers.includes(normalizedUser)) {
    return false;
  }

  const inputHash = crypto.createHash('sha256').update(password.trim()).digest('hex');
  const validHashes = [DEMO_PASSWORD_HASH, TEST_PASSWORD_HASH];
  if (CUSTOM_PASSWORD_HASH) validHashes.push(CUSTOM_PASSWORD_HASH);

  let matchFound = false;
  for (const targetHash of validHashes) {
    try {
      if (crypto.timingSafeEqual(Buffer.from(inputHash, 'hex'), Buffer.from(targetHash, 'hex'))) {
        matchFound = true;
      }
    } catch {
      // Buffer length mismatch or malformed hex
    }
  }

  return matchFound;
};

/**
 * Creates a signed admin session token with 24-hour expiration.
 */
export const createAdminToken = (username = 'admin') => {
  const email = username.includes('@') ? username : 'admin@gmail.com';
  const payload = {
    username,
    role: 'admin',
    email,
    exp: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
  };
  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', ADMIN_SECRET)
    .update(payloadBase64)
    .digest('base64url');

  return `${payloadBase64}.${signature}`;
};

/**
 * Verifies a signed admin session token and checks expiration.
 */
export const verifyAdminToken = (token) => {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;

    const [payloadBase64, signature] = parts;
    const expectedSig = crypto
      .createHmac('sha256', ADMIN_SECRET)
      .update(payloadBase64)
      .digest('base64url');

    const sigBuf = Buffer.from(signature);
    const expBuf = Buffer.from(expectedSig);

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
};
