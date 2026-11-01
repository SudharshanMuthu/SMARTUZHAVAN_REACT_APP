/**
 * Network utility with timeout support and friendly error formatting for React Native & Expo.
 * Prevents screens from freezing or displaying raw Java/socket stack traces on physical devices.
 */
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 7000
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      const timeoutErr = new Error(`Connection timed out after ${Math.round(timeoutMs / 1000)}s.`);
      timeoutErr.name = 'TimeoutError';
      throw timeoutErr;
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Transforms raw network exceptions (ConnectException, ECONNREFUSED, socket timeouts)
 * into clean, user-friendly messages for mobile display, logging detailed diagnostics in __DEV__.
 */
export const getFriendlyNetworkError = (error: any, endpoint?: string): string => {
  const rawMsg = error?.message || (typeof error === 'string' ? error : '');

  if (__DEV__) {
    console.warn(`[Network Diagnostic] Failed to reach ${endpoint || 'backend'}:`, rawMsg || error);
  }

  // Detect connection failures (Java ConnectException, socket refusal, loopback issues)
  if (
    rawMsg.includes('ConnectException') ||
    rawMsg.includes('Failed to connect') ||
    rawMsg.includes('Network request failed') ||
    rawMsg.includes('ECONNREFUSED') ||
    rawMsg.includes('ENOTFOUND')
  ) {
    if (__DEV__) {
      if (rawMsg.includes('localhost') || rawMsg.includes('127.0.0.1')) {
        return 'Cannot reach backend at localhost from physical phone. Please ensure your computer Wi-Fi IP is configured in mobile/.env.';
      }
      return 'Unable to connect to backend server. Verify phone is on same Wi-Fi and backend is running.';
    }
    return 'Unable to connect to Smart Uzhavan cloud server. Please check your internet connection and try again.';
  }

  // Detect timeouts
  if (
    error?.name === 'TimeoutError' ||
    error?.name === 'AbortError' ||
    rawMsg.includes('timed out') ||
    rawMsg.includes('aborted')
  ) {
    return 'Server request timed out. Please check your network connection and try again.';
  }

  // If the error message is clean text, return it
  if (rawMsg && !rawMsg.includes('fetch failed') && !rawMsg.includes('java.net') && !rawMsg.includes('TypeError')) {
    return rawMsg;
  }

  return 'Server connection failed. Please ensure the backend is running and reachable.';
};
