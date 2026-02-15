import { errorResponse, formatError } from '../utils/helpers.js'

/**
 * Global error handler middleware
 * Must be the last middleware registered
 */
export const globalErrorHandler = (error, req, res, next) => {
  console.error('Global error handler:', error)

  // Mongoose validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message)
    return res.status(400).json(errorResponse('Validation error', 400, messages))
  }

  // Mongoose duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0]
    return res.status(409).json(errorResponse(`${field} already exists`, 409))
  }

  // JWT errors
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json(errorResponse('Invalid token', 401))
  }

  if (error.name === 'TokenExpiredError') {
    return res.status(401).json(errorResponse('Token expired', 401))
  }

  // Default error
  const statusCode = error.statusCode || 500
  const message = error.message || 'Internal server error'

  return res.status(statusCode).json(errorResponse(message, statusCode))
}

/**
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res) => {
  return res.status(404).json(errorResponse(`Route ${req.originalUrl} not found`, 404))
}

/**
 * Catch async errors
 */
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}