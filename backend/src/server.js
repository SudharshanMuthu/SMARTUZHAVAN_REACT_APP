import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { getFirebaseAdminState } from './config/firebase.js';

const PORT = parseInt(process.env.PORT, 10) || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const NODE_ENV = process.env.NODE_ENV || 'development';

const server = app.listen(PORT, HOST, () => {
  const fbState = getFirebaseAdminState();
  console.log(`[Smart Uzhavan API] Server listening on ${HOST}:${PORT}`);
  console.log(`[Smart Uzhavan API] Environment: ${NODE_ENV}`);
  console.log(`[Smart Uzhavan API] Firebase Admin status: ${fbState.status}`);
});

/**
 * Handle uncaught exceptions and rejections safely.
 */
process.on('uncaughtException', (err) => {
  console.error('[Fatal Error] Uncaught Exception:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[Fatal Error] Unhandled Promise Rejection:', reason);
  process.exit(1);
});

/**
 * Graceful termination.
 */
const handleShutdown = (signal) => {
  console.log(`[Smart Uzhavan API] Received ${signal}. Shutting down gracefully...`);
  server.close(() => {
    console.log('[Smart Uzhavan API] HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => handleShutdown('SIGTERM'));
process.on('SIGINT', () => handleShutdown('SIGINT'));
