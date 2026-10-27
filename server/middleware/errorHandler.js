// Centralized error handler - never leaks stack traces to the client in production
const errorHandler = (err, req, res, next) => {
  console.error(err.stack || err.message);

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  }

  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate value entered for a unique field (e.g. email already registered).';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
