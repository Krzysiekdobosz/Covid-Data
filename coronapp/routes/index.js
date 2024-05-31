const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Data } = require('../models');
const { sequelize } = require('../models');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');




router.post('/register', [
  body('username').notEmpty(),
  body('password').isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', [
  body('username').notEmpty(),
  body('password').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});





router.get('/fetch-covid-data', async (req, res) => {
  try {
    const response = await axios.get('https://api.covid19api.com/summary');
    const data = response.data.Global;
    const newData = await Data.create({
      confirmed: data.TotalConfirmed,
      deaths: data.TotalDeaths,
      recovered: data.TotalRecovered,
      date: new Date()
    });
    res.status(200).json(newData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
const { body, validationResult } = require('express-validator');

router.post('/data', [
  body('confirmed').isInt(),
  body('deaths').isInt(),
  body('recovered').isInt(),
  body('date').isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const newData = await Data.create(req.body);
    res.status(201).json(newData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

// Middleware weryfikujący token
function authMiddleware(req, res, next) {
  const token = req.header('Authorization').replace('Bearer ', '');
  try {
    const decoded = jwt.verify(token, 'secret');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send('Unauthorized');
  }
}

// Przykład rejestracji użytkownika
router.post('/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 8);
  const user = await User.create({ ...req.body, password: hashedPassword });
  const token = jwt.sign({ userId: user.id }, 'secret', { expiresIn: '1h' });
  res.status(201).json({ user, token });
});


router.post('/data-transaction', async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const newData = await Data.create(req.body, { transaction: t });
    await t.commit();
    res.status(201).json(newData);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
