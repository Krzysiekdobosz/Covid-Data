const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { jwtSecret } = require('./config');
const { User } = require('./db');

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const validate = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  res.status(422).json({ message: result.array()[0].msg, errors: result.array() });
};

const authenticate = asyncHandler(async (req, res, next) => {
  const [scheme, token] = (req.header('Authorization') || '').split(' ');
  if (scheme !== 'Bearer' || !token) throw new HttpError(401, 'Authentication required');

  let payload;
  try {
    payload = jwt.verify(token, jwtSecret);
  } catch {
    throw new HttpError(401, 'Invalid or expired token');
  }

  req.user = await User.findByPk(payload.sub);
  if (!req.user) throw new HttpError(401, 'User no longer exists');
  next();
});

const notFound = (req, res) => res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} not found` });

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(409).json({ message: 'This username is already taken' });
  }
  const status = err.status || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ message: status >= 500 ? 'Internal server error' : err.message });
};

module.exports = { HttpError, asyncHandler, validate, authenticate, notFound, errorHandler };
