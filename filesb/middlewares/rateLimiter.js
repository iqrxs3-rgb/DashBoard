import rateLimit from 'express-rate-limit';

// عام - 100 request كل 15 دقيقة
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health' // تخطي health checks
});

// Auth - 5 attempts كل 15 دقيقة (strict)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

// Create/Update - 20 requests كل دقيقة
export const createLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many requests, please slow down',
  standardHeaders: true,
  legacyHeaders: false
});

export default {
  general: generalLimiter,
  auth: authLimiter,
  create: createLimiter
};