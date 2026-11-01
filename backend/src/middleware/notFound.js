/**
 * 404 Not Found Middleware.
 * Catches all unmatched routes and returns a structured JSON response.
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Endpoint not found: ${req.method} ${req.originalUrl}`,
    },
  });
};
