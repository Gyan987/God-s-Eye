/**
 * Standardized API Response Utility
 * Provides consistent response formatting across all endpoints
 */

class APIResponse {
  constructor(statusCode, data, message = 'Success') {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    this.success = statusCode < 400;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      success: this.success,
      statusCode: this.statusCode,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp
    };
  }
}

// Success response handler
const sendSuccess = (res, data, message = 'Success', statusCode = 200) => {
  const response = new APIResponse(statusCode, data, message);
  return res.status(statusCode).json(response.toJSON());
};

// Error response handler
const sendError = (res, message = 'Error', statusCode = 400, errors = null) => {
  const response = new APIResponse(statusCode, errors, message);
  return res.status(statusCode).json(response.toJSON());
};

// Paginated response handler
const sendPaginated = (res, items, total, page, limit, message = 'Success', statusCode = 200) => {
  const response = new APIResponse(statusCode, {
    items,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    }
  }, message);
  return res.status(statusCode).json(response.toJSON());
};

module.exports = {
  APIResponse,
  sendSuccess,
  sendError,
  sendPaginated
};
