# Smart Uzhavan (ஸ்மார்ட் உழவன்) — React Modernization Ecosystem

Smart Uzhavan is a comprehensive digital agriculture platform tailored for Tamil Nadu farmers, wholesale produce buyers, agricultural transport operators, and cold-storage warehouse owners.

This repository (`D:\smart_uzhavan_react\`) contains the complete modernized architecture migrated from the original Flutter application (`D:\smart_uzhavan\`), built with modern, maintainable, production-ready web and mobile technologies.

---

## Architecture Overview

```
                                      +---------------------------------------------+
                                      |            Google Cloud Firebase            |
                                      | - Firebase Auth (Email/Password, Roles)     |
                                      | - Cloud Firestore (Real-time DB)            |
                                      | - Firebase Storage (Crops, Receipts, Photos)|
                                      +---------------------------------------------+
                                                     ^              ^
                                                     |              |
                      +------------------------------+              +-----------------------------+
                      |                                                                           |
                      v                                                                           v
+------------------------------------------+                             +------------------------------------------+
|       React Native + Expo Mobile         |                             |          React.js Admin Panel            |
|       (`mobile/`)                        |                             |          (`admin/`)                      |
| - 4 Dashboards (Farmer, Buyer, Transit,  |                             | - Moderation (Users, Crops)              |
|   Warehouse)                             |                             | - Logistics & Storage Oversight          |
| - AI Agriculture Suite (Gemini / Agron.) |                             | - Real-time System Telemetry             |
| - Live Mandi Prices & Open-Meteo Weather |                             | - Security Audit Logs                    |
| - Crop Marketplace & Order Placement     |                             | - Built with Vite 6, React 19, Tailwind  |
+------------------------------------------+                             +------------------------------------------+
                      \                                                                           /
                       \                                                                         /
                        +----------------------------> [ REST API ] <---------------------------+
                                                             |
                                                             v
                                          +------------------------------------------+
                                          |          Node.js + Express Backend       |
                                          |          (`backend/`)                    |
                                          | - Open-Meteo Meteorological Gateway      |
                                          | - Mandi APMC Price Benchmarks (Agmarknet)|
                                          | - Agricultural Alerts & Schemes (TNAU)   |
                                          | - Google Gemini Multi-Turn AI Advisor    |
                                          | - Firebase Admin Token Guard & Telemetry |
                                          +------------------------------------------+
```

---

## 1. Directory Structure

- **`mobile/`**: React Native application powered by Expo SDK 58, React 19, React Navigation 7, TypeScript, and `@expo/vector-icons`.
- **`backend/`**: Node.js + Express.js API server (ES modules), secured with Helmet, configurable CORS, and Firebase Admin SDK.
- **`admin/`**: High-performance React.js Web Admin dashboard built with React 19, Vite 6, Tailwind CSS, and Lucide React.
- **`D:\smart_uzhavan\`**: Original Flutter reference codebase — **strictly preserved and 100% read-only**.

---

## 2. Integrated Feature Matrix (20 Core Modules)

1. **Firebase Authentication**: Email/password authentication, persistent session management, role attribution.
2. **Role-Based Routing**: Dynamic interface switching between `Farmer`, `Buyer`, `Transporter`, and `Warehouse`.
3. **Farmer Dashboard**: Harvest listing management, weather cards, quick-access AI advisory, price checks.
4. **Buyer Dashboard & Procurement**: Direct farm produce discovery, in-app order placement modal, and live order tracking.
5. **Transporter Hub**: Vehicle fleet registration, trip management, milestone dispatch simulator (`requested` -> `accepted` -> `on_trip` -> `completed`).
6. **Warehouse Hub**: Facility listing, slot capacity tracking, farmer storage bookings.
7. **Crop Marketplace**: High-grade produce catalog filtered by commodity, quality grade, and Tamil Nadu district.
8. **AI Farming Assistant**: Conversational agronomy chatbot with English & Tamil bilingual support.
9. **Crop Health Scanner**: Disease identification protocol with symptoms, causes, IPM treatments, and preventive measures.
10. **Smart Irrigation Advisor**: Soil-type and crop-stage water calculation engine minimizing groundwater depletion.
11. **Crop Yield Prediction**: Expected yield (Quintals/Acre) estimator factoring in land area and irrigation method.
12. **Crop Recommendation**: Soil texture, rainfall, and season-based crop suitability recommendations.
13. **Voice Assistant**: Speech-guided farming command interface with bilingual prompts.
14. **Live Weather & Forecast**: Real-time Open-Meteo meteorological API with hourly and 7-day agricultural forecasts.
15. **Mandi Market Prices**: Daily APMC benchmark prices across 7 major Tamil Nadu mandis (Agmarknet modal prices).
16. **Agricultural Alerts & Schemes**: Breaking alerts from TNAU Agromet and subsidy guides (PM-KISAN, Kalaignar Scheme, PMKSY).
17. **Notifications Hub**: In-app real-time notification listener for crop orders, dispatches, and weather warnings.
18. **Web Admin Dashboard**: Real-time ecosystem statistics, active users breakdown, and storage metrics.
19. **Content Moderation**: Administrative moderation for flagged produce listings and user account status.
20. **Security & Audit Logs**: Immutable administrative activity tracking backed by Firestore collection `admin_audit_logs`.

---

## 3. Environment Variables Configuration

### A. Mobile Application (`mobile/.env`)
```ini
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=smart-uzhavan-369b0.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=smart-uzhavan-369b0
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=smart-uzhavan-369b0.firebasestorage.app
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=794508821915
EXPO_PUBLIC_FIREBASE_APP_ID=1:794508821915:web:0b2576b928f62c828ca1fc
EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID=G-CGE8CWW38R
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

### B. Node.js Backend (`backend/.env`)
```ini
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:8081,http://localhost:5173,http://127.0.0.1:5173
FIREBASE_PROJECT_ID=smart-uzhavan-369b0
# Optional Gemini API Key for live AI responses (falls back cleanly to agronomic rules when absent):
# GEMINI_API_KEY=your_gemini_api_key_here
```

### C. Admin Panel (`admin/.env`)
```ini
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=smart-uzhavan-369b0.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=smart-uzhavan-369b0
VITE_FIREBASE_STORAGE_BUCKET=smart-uzhavan-369b0.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=794508821915
VITE_FIREBASE_APP_ID=1:794508821915:web:0b2576b928f62c828ca1fc
VITE_API_URL=http://localhost:5000/api
```

---

## 4. Setup & Running Instructions

### Backend
```powershell
cd D:\smart_uzhavan_react\backend
npm install
npm test            # Runs full integration test suite (10/10 passed)
npm run dev         # Starts server on http://localhost:5000
```

### Mobile App (React Native + Expo)
```powershell
cd D:\smart_uzhavan_react\mobile
npm install
npx tsc --noEmit    # TypeScript verification (0 errors)
npx expo-doctor     # Checks configuration (20/20 passed)
npx expo start      # Starts Expo Metro bundler
```

### Web Admin Panel
```powershell
cd D:\smart_uzhavan_react\admin
npm install
npm run build       # Validates TypeScript & compiles production bundle (dist/)
npm run dev         # Starts development server on http://localhost:5173
```

---

## 5. Security & Safety Principles

1. **Zero Modification to Original Flutter Reference**: `D:\smart_uzhavan\` is strictly read-only and preserved for reference.
2. **No MySQL / Secondary DB**: Cloud Firestore (`smart-uzhavan-369b0`) remains the single source of truth across all platforms.
3. **External Secrets Safeguarded**: All external API keys and administrative service credentials remain exclusively on the server.
4. **No Falsified Data**: When third-party APIs are in development or unconfigured, the system explicitly returns fallback agronomic guidance with clear disclaimers.
5. **Human Approval Gateway**: Production deployment actions are halted pending explicit user authorization.
