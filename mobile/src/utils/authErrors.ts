/**
 * Maps Firebase Auth error codes to user-friendly messages.
 */
export const getFriendlyAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Invalid email or password. Please try again.';
    case 'auth/email-already-in-use':
      return 'This email address is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please verify your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many unsuccessful attempts. Please wait a few moments and try again.';
    case 'auth/user-disabled':
      return 'This user account has been disabled. Please contact support.';
    default:
      return 'An error occurred during authentication. Please try again.';
  }
};
