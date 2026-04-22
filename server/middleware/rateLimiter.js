import rateLimit from 'express-rate-limit';

// General rate limiter for all API requests
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Relaxed for testing (1000 requests per 15 mins)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests, please try again later.' }
});

// Stricter limiter for authentication routes (login/register/invite acceptance)
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // Relaxed for testing (100 attempts per hour)
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts, please try again in an hour.' }
});

// Stricter limiter for sending invitations
export const inviteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 invitations per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many invitations sent, please try again in an hour.' }
});
