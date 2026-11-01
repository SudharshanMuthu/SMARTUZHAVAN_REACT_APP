# Smart Uzhavan — Node.js + Express Backend API

Backend foundation for the Smart Uzhavan agriculture ecosystem, built with Node.js, Express.js (ES modules), and Firebase Admin.

---

## 1. Quick Start

### Prerequisites
- Node.js `v20+` (Tested on `v24.16.0`)
- npm `v10+` (Tested on `v11.13.0`)

### Installation
From the `backend` directory:
```bash
npm install
```

### Running the Server
```bash
# Production mode
npm start

# Development mode (with live watch reload)
npm run dev
```

---

## 2. Environment Configuration

Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

### Environment Variables
| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | HTTP port the server listens on | `5000` |
| `NODE_ENV` | Runtime environment (`development`, `production`) | `development` |
| `CORS_ORIGIN` | Comma-separated list of allowed client origins | Local dev ports (`8081`, `19006`) |
| `REQUEST_LIMIT` | Maximum JSON request payload size | `1mb` |
| `FIREBASE_PROJECT_ID` | Firebase Project ID | *None* |
| `FIREBASE_CLIENT_EMAIL` | Service Account email address | *None* |
| `FIREBASE_PRIVATE_KEY` | Service Account private key string | *None* |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to service account JSON (alternative) | *None* |

> **Security Note:** Never commit `.env` or any `*service-account*.json` files to Git. They are ignored by default in `.gitignore`.

---

## 3. Endpoints

### Health Check
- **Route:** `GET /api/health`
- **Description:** Verifies server status, environment, and Firebase Admin module readiness.
- **Example Response:**
  ```json
  {
    "service": "Smart Uzhavan API",
    "status": "healthy",
    "environment": "development",
    "timestamp": "2026-10-29T15:28:00.000Z",
    "firebase": {
      "status": "PREPARED_NOT_CONFIGURED",
      "isConfigured": false
    }
  }
  ```

---

## 4. Architecture & Security Measures

- **Security Headers:** Enabled via `helmet` for protection against standard HTTP vulnerabilities.
- **Strict CORS Policy:** Configurable origin matching preventing unauthorized cross-origin requests.
- **Payload Limiting:** Request body size limited to `1mb` to prevent DoS via payload memory exhaustion.
- **404 Handling:** Centralized JSON response for all undefined endpoints.
- **Error Sanitization:** Stack traces and internal paths are suppressed in production.
- **Firebase Admin Isolation:** Server-side admin credentials are completely isolated from client/mobile apps.
- **Safe Initialization Guard:** Server launches normally even when Firebase credentials are not yet populated.
