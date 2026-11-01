/**
 * Centralized Error Handling Middleware.
 * Converts all uncaught server errors into uniform JSON responses.
 * Never leaks internal file system paths, stack traces (in non-dev), or credentials.
 */
export const errorHandler = (err, req, res, next) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const statusCode = err.status || err.statusCode || 500;

  const response = {
    success: false,
    error: {
      code: err.code || (statusCode === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR'),
      message: err.message || 'An unexpected error occurred.',
    },
  };

  if (!isProduction && err.stack) {
    response.error.stack = err.stack;
  }

  // Safe server logging
  if (statusCode >= 500) {
    console.error(`[Error] ${req.method} ${req.originalUrl}:`, err.message);
  }

  res.status(statusCode).json(response);
};
