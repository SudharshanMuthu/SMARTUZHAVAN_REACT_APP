import { getAdminAuth, getFirebaseAdminState } from '../config/firebase.js';
import { verifyAdminToken } from '../utils/adminAuthUtil.js';

/**
 * Retrieves the list of authorized admin emails from the environment.
 * Default admin email matches the Flutter reference application fallback.
 */
export const getAdminEmails = () => {
  const envEmails = process.env.ADMIN_EMAILS || 'admin@example.com';
  return envEmails.split(',').map((email) => email.trim().toLowerCase());
};

/**
 * Middleware that validates administrator authentication & authorization.
 * 
 * Verifies:
 * 1. Bearer token presence in Authorization header.
 * 2. Token authenticity using Firebase Admin SDK verifyIdToken.
 * 3. User authorization via:
 *    a) Firebase Custom Claim `admin === true`, OR
 *    b) Email presence in `ADMIN_EMAILS` server-side allowlist.
 */
export const requireAdminAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Missing or malformed Authorization header with Bearer token.',
        code: 'AUTH_TOKEN_MISSING',
      });
    }

    const idToken = authHeader.split('Bearer ')[1].trim();
    if (!idToken) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Token is empty.',
        code: 'AUTH_TOKEN_EMPTY',
      });
    }

    // 1. Check for cryptographically signed Admin Session Token
    const sessionPayload = verifyAdminToken(idToken);
    if (sessionPayload) {
      req.adminUser = {
        uid: sessionPayload.username || 'admin',
        username: sessionPayload.username || 'admin',
        email: sessionPayload.email || 'admin@smartuzhavan.com',
        role: 'admin',
        isAdmin: true,
        authMethod: 'SESSION_TOKEN',
      };
      return next();
    }

    const adminState = getFirebaseAdminState();
    if (!adminState.isConfigured) {
      // Safe developer fallback if Firebase Admin private keys are pending configuration
      const devAdminSecret = process.env.ADMIN_DEV_SECRET;
      if (
        process.env.NODE_ENV !== 'production' &&
        devAdminSecret &&
        req.headers['x-admin-key'] === devAdminSecret
      ) {
        req.adminUser = {
          uid: 'dev-admin-override',
          email: 'admin@smartuzhavan.local',
          isAdmin: true,
          mode: 'DEV_SECRET_OVERRIDE',
        };
        return next();
      }

      return res.status(503).json({
        success: false,
        error: 'Service Unavailable: Firebase Admin SDK is not configured with service-account credentials on the server.',
        code: 'FIREBASE_ADMIN_UNCONFIGURED',
        missingKeys: adminState.missingKeys,
      });
    }

    // Verify token with Firebase Admin
    const auth = getAdminAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    const userEmail = (decodedToken.email || '').toLowerCase();
    const authorizedEmails = getAdminEmails();

    const isClaimAdmin = decodedToken.admin === true;
    const isEmailAdmin = userEmail && authorizedEmails.includes(userEmail);

    if (!isClaimAdmin && !isEmailAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: Authenticated user does not possess administrator privileges.',
        code: 'ADMIN_ACCESS_DENIED',
        email: userEmail,
      });
    }

    req.adminUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      isAdmin: true,
      authMethod: isClaimAdmin ? 'CUSTOM_CLAIM' : 'EMAIL_ALLOWLIST',
    };

    next();
  } catch (error) {
    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Firebase ID token has expired. Please log in again.',
        code: 'AUTH_TOKEN_EXPIRED',
      });
    }

    return res.status(401).json({
      success: false,
      error: `Unauthorized: Token verification failed: ${error.message}`,
      code: 'AUTH_TOKEN_INVALID',
    });
  }
};
