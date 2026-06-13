// ─── Custom AppError class ────────────────────────────────────────────────────
// Use this for all operational errors (known errors we handle intentionally).
// Never use for programming errors — let those crash and be caught by the
// uncaughtException handler.
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── Async error catcher ─────────────────────────────────────────────────────
// Wraps async controller functions to avoid try/catch boilerplate.
// Usage: router.get('/route', catchAsync(async (req, res, next) => { ... }))
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// ─── Mongoose-specific error handlers ────────────────────────────────────────
const handleCastError = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}`, 400);

const handleDuplicateKey = (err) => {
  const field = Object.keys(err.keyValue)[0];
  return new AppError(
    `${field.charAt(0).toUpperCase() + field.slice(1)} already exists. Please use a different value.`,
    409
  );
};

const handleValidationError = (err) => {
  const messages = Object.values(err.errors).map((e) => e.message);
  return new AppError(`Validation failed: ${messages.join('. ')}`, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token. Please log in again.', 401);

const handleJWTExpired = () =>
  new AppError('Your token has expired. Please log in again.', 401);

// ─── Global error response handler ───────────────────────────────────────────
// Express recognizes 4-arg middleware as error handlers.
const globalErrorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Transform known Mongoose/JWT errors into AppErrors
  if (err.name === 'CastError') error = handleCastError(err);
  if (err.code === 11000) error = handleDuplicateKey(err);
  if (err.name === 'ValidationError') error = handleValidationError(err);
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpired();

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Something went wrong';

  // Development: include stack trace for debugging
  // Production: clean message only — never leak internals
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      error: err,
      stack: err.stack,
    }),
  });
};

module.exports = { AppError, catchAsync, globalErrorHandler };
