import rateLimit from "express-rate-limit";

export const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5, // stricter for auth endpoints
  standardHeaders: true,
  legacyHeaders: false,
});

export const deviceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100, // device operations
  standardHeaders: true,
  legacyHeaders: false,
});
