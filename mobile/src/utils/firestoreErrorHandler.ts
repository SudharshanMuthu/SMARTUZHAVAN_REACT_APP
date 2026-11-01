import { Alert } from 'react-native';

/**
 * Checks if an error is a Firebase Firestore permission-denied rejection.
 */
export const isPermissionError = (error: any): boolean => {
  if (!error) return false;
  const code = error?.code || '';
  const msg = error?.message || '';
  return (
    code === 'permission-denied' ||
    msg.toLowerCase().includes('missing or insufficient permissions') ||
    msg.toLowerCase().includes('permission-denied') ||
    msg.toLowerCase().includes('permission denied')
  );
};

/**
 * Returns a human-friendly error explanation instead of raw Firebase stack trace.
 */
export const getFriendlyErrorMessage = (error: any, fallbackMessage: string): string => {
  if (isPermissionError(error)) {
    return 'Permission Denied: Your account is currently not authorized for this action. Please verify that your account has the required role and that Firestore Security Rules are active.';
  }
  return error?.message || fallbackMessage;
};

/**
 * Shows a user-friendly Alert for Firestore operations without unhandled redboxes.
 */
export const showFirestoreErrorAlert = (
  title: string,
  error: any,
  fallbackMessage: string,
  onRetry?: () => void
): void => {
  const message = getFriendlyErrorMessage(error, fallbackMessage);

  const buttons: any[] = [];
  if (onRetry) {
    buttons.push({
      text: 'Cancel',
      style: 'cancel',
    });
    buttons.push({
      text: 'Retry',
      onPress: onRetry,
    });
  } else {
    buttons.push({
      text: 'OK',
      style: 'default',
    });
  }

  Alert.alert(title, message, buttons);
};
