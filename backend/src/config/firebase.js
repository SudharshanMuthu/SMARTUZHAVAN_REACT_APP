import admin from 'firebase-admin';

/**
 * Validates whether real Firebase Admin credentials have been provided.
 * Differentiates placeholder text from actual credentials.
 */
const detectMissingKeys = () => {
  const missing = [];
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  const googleAppCreds = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (googleAppCreds) {
    return [];
  }

  if (!projectId || projectId.includes('your_firebase_project_id')) {
    missing.push('FIREBASE_PROJECT_ID');
  }
  if (!clientEmail || clientEmail.includes('your_service_account_email')) {
    missing.push('FIREBASE_CLIENT_EMAIL');
  }
  if (!privateKey || privateKey.includes('your_private_key_here')) {
    missing.push('FIREBASE_PRIVATE_KEY');
  }

  return missing;
};

let adminApp = null;
const missingKeys = detectMissingKeys();

let adminState = {
  status: 'PREPARED_NOT_CONFIGURED',
  isConfigured: false,
  projectId: process.env.FIREBASE_PROJECT_ID || null,
  missingKeys,
};

/**
 * Initialize Firebase Admin if valid configuration is supplied.
 * If credentials are not present, initialization is skipped safely so the server can run.
 */
if (missingKeys.length === 0) {
  try {
    if (admin.apps.length === 0) {
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        adminApp = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
        });
      } else {
        const formattedKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n');
        adminApp = admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: formattedKey,
          }),
        });
      }
    } else {
      adminApp = admin.apps[0];
    }

    adminState = {
      status: 'CONFIGURED',
      isConfigured: true,
      projectId: process.env.FIREBASE_PROJECT_ID || adminApp.options.projectId || 'configured',
      missingKeys: [],
    };
  } catch (error) {
    adminState = {
      status: 'INITIALIZATION_FAILED',
      isConfigured: false,
      projectId: process.env.FIREBASE_PROJECT_ID || null,
      missingKeys: [],
      error: error.message,
    };
  }
}

/**
 * Safely inspect Firebase Admin integration status.
 * Never exposes private keys or secret values.
 */
export const getFirebaseAdminState = () => ({
  status: adminState.status,
  isConfigured: adminState.isConfigured,
  projectId: adminState.projectId,
  missingKeys: adminState.missingKeys,
});

/**
 * Safe accessor for Firebase Admin Auth.
 * Throws a clear error if invoked when Firebase is not configured.
 */
export const getAdminAuth = () => {
  if (!adminState.isConfigured || !adminApp) {
    throw new Error(
      '[Firebase Admin] Auth is not configured. Supply valid FIREBASE_* credentials in .env.'
    );
  }
  return admin.auth(adminApp);
};

/**
 * Safe accessor for Firebase Admin Firestore.
 * Throws a clear error if invoked when Firebase is not configured.
 */
export const getAdminFirestore = () => {
  if (!adminState.isConfigured || !adminApp) {
    throw new Error(
      '[Firebase Admin] Firestore is not configured. Supply valid FIREBASE_* credentials in .env.'
    );
  }
  return admin.firestore(adminApp);
};

/**
 * Safe accessor for Firebase Admin Storage.
 * Throws a clear error if invoked when Firebase is not configured.
 */
export const getAdminStorage = () => {
  if (!adminState.isConfigured || !adminApp) {
    throw new Error(
      '[Firebase Admin] Storage is not configured. Supply valid FIREBASE_* credentials in .env.'
    );
  }
  return admin.storage(adminApp);
};

export default adminApp;
