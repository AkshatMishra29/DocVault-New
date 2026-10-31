import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { User } from '../modules/auth/auth.model.js';

/**
 * Authentication middleware to isolate customer data.
 * Checks Bearer header or fallback query param (?token=) for downloads.
 * Validates singleSessionOnly constraint if enabled by the user.
 */
export async function authenticateToken(req, res, next) {
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

  try {
    const decoded = jwt.verify(token, config.jwtSecret);
    if (!decoded || !decoded.userId) {
      req.user = null;
      return next();
    }

    // Check singleSessionOnly requirement if token carries a sessionVersion
    if (decoded.sessionVersion !== undefined) {
      const user = await User.findById(decoded.userId).select('sessionVersion singleSessionOnly');
      if (user && user.singleSessionOnly) {
        if (user.sessionVersion !== decoded.sessionVersion) {
          req.user = null;
          req.sessionTerminated = true;
          return next();
        }
      }
    }

    req.user = decoded;
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

/**
 * Guard middleware requiring an active authenticated user.
 */
export function requireAuth(req, res, next) {
  if (req.sessionTerminated) {
    return res.status(401).json({
      success: false,
      code: 'SESSION_TERMINATED',
      error: 'Your session was terminated because another device signed into your vault.',
    });
  }

  if (!req.user || !req.user.userId) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Access token required' });
  }
  next();
}

