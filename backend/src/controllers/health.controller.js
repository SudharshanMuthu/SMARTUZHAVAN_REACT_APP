import { getFirebaseAdminState } from '../config/firebase.js';

/**
 * Health Check Controller.
 * Returns operational status of the Smart Uzhavan API.
 * Never exposes credentials, secrets, or internal server paths.
 */
export const getHealth = (req, res) => {
  const firebaseState = getFirebaseAdminState();

  res.status(200).json({
    service: 'Smart Uzhavan API',
    status: 'healthy',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    firebase: {
      status: firebaseState.status,
      isConfigured: firebaseState.isConfigured,
    },
  });
};
