import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';

/**
 * Authentication middleware to isolate customer data.
 * Checks Bearer header or fallback query param (?token=) for downloads.
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  let token = authHeader && authHeader.split(' ')[1];

  // Allow download token via query param for direct <a> or window.open links
  if (!token && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    req.user = null;
    return next();
  }

  jwt.verify(token, config.jwtSecret, (err, user) => {
    if (!err && user) {
      req.user = user;
    } else {
      req.user = null;
    }
    next();
  });
}

/**
 * Guard middleware requiring an active authenticated user.
 */
export function requireAuth(req, res, next) {
  if (!req.user || !req.user.userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Access token required' });
  }
  next();
}

