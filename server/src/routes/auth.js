const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { User } = require('../db');
const { jwtSecret } = require('../config');
const { HttpError, asyncHandler, validate, authenticate } = require('../middleware');

const router = express.Router();

const publicUser = (user) => ({ id: user.id, username: user.username });
const signToken = (user) => jwt.sign({ sub: user.id }, jwtSecret, { expiresIn: '8h' });

const credentials = [
  body('username').trim().isLength({ min: 3, max: 40 }).withMessage('Username must be 3–40 characters long'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

router.post('/register', credentials, validate, asyncHandler(async (req, res) => {
  const { username, password } = req.body;
  const user = await User.create({ username, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: signToken(user), user: publicUser(user) });
}));

router.post('/login', credentials, validate, asyncHandler(async (req, res) => {
  const user = await User.findOne({ where: { username: req.body.username } });
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    throw new HttpError(401, 'Invalid username or password');
  }
  res.json({ token: signToken(user), user: publicUser(user) });
}));

router.get('/me', authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

module.exports = router;
