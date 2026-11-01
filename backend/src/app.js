import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import healthRoutes from './routes/health.routes.js';
import aiRoutes from './routes/ai.routes.js';
import weatherRoutes from './routes/weather.routes.js';
import marketRoutes from './routes/market.routes.js';
import alertsRoutes from './routes/alerts.routes.js';
import adminRoutes from './routes/admin.routes.js';
import agriStoreRoutes from './routes/agristore.routes.js';
import farmToolsRoutes from './routes/farmtools.routes.js';
import ecosystemRoutes from './routes/ecosystem.routes.js';
import { notFoundHandler } from './middleware/notFound.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

/**
 * Security HTTP Headers.
 * Uses Helmet to protect against common web vulnerabilities.
 */
app.use(helmet());

/**
 * Configurable CORS Policy.
 * In production, specific allowed origins must be set via CORS_ORIGIN in .env.
 * Example: CORS_ORIGIN=https://app.smartuzhavan.com,http://localhost:8081
 */
const getAllowedOrigins = () => {
  const envOrigins = process.env.CORS_ORIGIN;
  if (!envOrigins) {
    // Default safe local origins for development (Expo Metro, Vite Admin & Web)
    return [
      'http://localhost:8081',
      'http://localhost:19006',
      'http://127.0.0.1:8081',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ];
  }
  return envOrigins.split(',').map((origin) => origin.trim());
};

const allowedOrigins = getAllowedOrigins();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        allowedOrigins.includes('*') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }

      return callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
  })
);

/**
 * Request Body Parsing.
 * Limits JSON payloads to avoid Denial of Service via memory exhaustion.
 */
const requestLimit = process.env.REQUEST_LIMIT || '10mb';
app.use(express.json({ limit: requestLimit }));
app.use(express.urlencoded({ extended: true, limit: requestLimit }));

/**
 * Application Routes.
 */
// Root info & health check for web browsers and cloud load balancers
app.get('/', (req, res) => {
  res.status(200).json({
    service: 'Smart Uzhavan API',
    status: 'online',
    version: '1.0.0',
    documentation: '/api/health',
    timestamp: new Date().toISOString(),
  });
});
app.use('/health', healthRoutes);

app.use('/api/health', healthRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/agri-store', agriStoreRoutes);
app.use('/api/farm-tools', farmToolsRoutes);
app.use('/api/ecosystem', ecosystemRoutes);

/**
 * 404 Catch-All & Centralized Error Handler.
 */
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
