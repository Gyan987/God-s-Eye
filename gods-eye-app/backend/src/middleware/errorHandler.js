const logger = require('../utils/logger');
const { sendError } = require('../utils/apiResponse');

const notFound = (req, res) => {
  logger.warn('Route not found', { path: req.path, method: req.method });
  return sendError(res, 'Route not found', 404);
};

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Internal server error';

  logger.error('Request error', {
    statusCode,
    message,
    path: req.path,
    method: req.method,
    userId: req.user?._id,
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message
    }));
    return sendError(res, 'Validation failed', 400, errors);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return sendError(res, 'Invalid ID format', 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Token expired', 401);
  }

  // Duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return sendError(res, `${field} already exists`, 400);
  }

  return sendError(res, message, statusCode);
};

module.exports = { notFound, errorHandler };
