import { Platform, NativeModules } from 'react-native';

/**
 * Extracts the Metro bundler host IP address when running in development.
 * On physical devices connected via Expo Go / Metro, `NativeModules.SourceCode.scriptURL`
 * contains the development machine's IP (e.g., "http://10.254.67.59:8081/index.bundle...").
 */
const getDevServerHost = (): string | null => {
  try {
    const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
    if (scriptURL) {
      const match = scriptURL.match(/^[a-zA-Z]+:\/\/([^:/]+)/);
      if (match && match[1]) {
        const host = match[1];
        if (host !== 'localhost' && host !== '127.0.0.1') {
          return host;
        }
      }
    }
  } catch {
    // Non-critical, fallback to standard resolution
  }
  return null;
};

/**
 * Checks if a given URL resolves to a local device loopback (localhost or 127.0.0.1).
 */
export const isLocalhostUrl = (url: string): boolean => {
  return /^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(url.trim());
};

/**
 * Checks if a given URL is a private local LAN address (10.x, 192.168.x, 172.16-31.x).
 */
export const isPrivateLanUrl = (url: string): boolean => {
  return /^(https?:\/\/)?(10\.\d+\.\d+\.\d+|192\.168\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?(\/.*)?$/i.test(url.trim());
};

/**
 * Resolves the backend API base URL.
 *
 * In Production (standalone APK / release mode):
 * 1. Requires a verified public HTTPS URL (e.g. `https://smart-uzhavan-api.onrender.com/api`).
 * 2. Ignores development LAN IPs and localhost to prevent network timeouts and freezes on cellular networks.
 *
 * In Development (__DEV__):
 * 1. Uses EXPO_PUBLIC_API_URL from .env (e.g. `http://10.254.67.59:5000/api`).
 * 2. Auto-detects Metro host IP from bundle scriptURL if localhost was configured.
 * 3. Falls back to Android emulator or localhost.
 */
export const getApiBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

  if (envUrl && envUrl.trim() !== '') {
    let clean = envUrl.trim().replace(/\/+$/, '');

    // Normalize path: ensure root points to /api
    if (clean.endsWith('/api/ai')) {
      clean = clean.replace(/\/api\/ai$/, '/api');
    } else if (!clean.endsWith('/api')) {
      clean = `${clean}/api`;
    }

    // Public HTTPS URL - always valid in both dev and production
    if (clean.startsWith('https://')) {
      return clean;
    }

    // If running in production release APK (!__DEV__)
    if (!__DEV__) {
      // In production release mode, private LAN or localhost cannot be reached over cellular/external Wi-Fi.
      // If a public HTTPS URL is not yet configured, return empty string so network requests fail fast
      // and allow the app to operate cleanly via Cloud Firestore & verified offline datasets.
      if (isLocalhostUrl(clean) || isPrivateLanUrl(clean)) {
        return '';
      }
      return clean;
    }

    // Development mode (__DEV__):
    // If configured as localhost on Android, swap for detected Metro machine IP
    if (Platform.OS === 'android' && isLocalhostUrl(clean)) {
      const metroHost = getDevServerHost();
      if (metroHost) {
        return clean.replace(/(localhost|127\.0\.0\.1)/i, metroHost);
      }
    }

    return clean;
  }

  // If in production release without configured env URL, return empty string
  if (!__DEV__) {
    return '';
  }

  // Development auto-detect dev machine IP from Metro bundle URL
  const metroHost = getDevServerHost();
  if (metroHost) {
    return `http://${metroHost}:5000/api`;
  }

  // Dev fallbacks
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * Provides diagnostic info about the active API connection.
 */
export const getApiDiagnostics = () => {
  const url = API_BASE_URL;
  const isLocalhost = isLocalhostUrl(url);
  const metroHost = getDevServerHost();

  return {
    baseUrl: url,
    isLocalhost,
    detectedMetroHost: metroHost,
    platform: Platform.OS,
    isConfiguredViaEnv: Boolean(process.env.EXPO_PUBLIC_API_URL),
  };
};
