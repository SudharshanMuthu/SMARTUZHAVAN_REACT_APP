export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

export type FirebaseIntegrationStatus =
  | 'PREPARED_NOT_CONFIGURED'
  | 'CONFIGURED_READY'
  | 'INITIALIZATION_FAILED';

export interface FirebaseServiceState {
  status: FirebaseIntegrationStatus;
  isConfigured: boolean;
  missingKeys: string[];
}
