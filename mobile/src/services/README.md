# Firebase Service Preparation & Environment Documentation

## Overview
This module prepares the Firebase Web/Modular SDK integration for Smart Uzhavan React Native (Expo) while preserving security best practices.

## Current Status
- **Status:** `PREPARED_NOT_CONFIGURED`
- The service architecture, TypeScript interfaces, and safe initialization guards are implemented.
- **No live connection is made** until valid environment variables are supplied. Invented or mock credentials are intentionally avoided.

## Configuration Instructions
1. Copy `.env.example` to `.env` in the `mobile/` root:
   ```bash
   cp .env.example .env
   ```
2. Populate the following Expo environment variables using your project credentials from the Firebase Console (Project Settings > General > Web apps):
   - `EXPO_PUBLIC_FIREBASE_API_KEY`
   - `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
   - `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `EXPO_PUBLIC_FIREBASE_APP_ID`
   - `EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID`

3. When valid credentials are provided, `getFirebaseServiceState()` will report `status: 'CONFIGURED_READY'`.
