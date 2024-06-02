/**
 * Ten plik definiuje różne trasy (endpoints) dla aplikacji Express.
 * Obejmuje funkcjonalność rejestracji i logowania użytkowników z wykorzystaniem bcrypt i JWT,
 * pobieranie danych o COVID-19 z zewnętrznego API oraz tworzenie wpisów w bazie danych.
 * Używa również walidacji danych wejściowych za pomocą express-validator.
 */

const express = require('express');
const router = express.Router();
const axios = require('axios');
const { Data } = require('../models');
const { sequelize } = require('../models');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { User } = require('../models');

// Trasa do rejestracji użytkownika
router.post('/register', [
  body('username').notEmpty(), // Walidacja: username nie może być pusty
  body('password').isLength({ min: 5 }) // Walidacja: password musi mieć przynajmniej 5 znaków
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Zwrócenie błędów walidacji
  }

  const { username, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10); // Hashowanie hasła
    const user = await User.create({ username, password: hashedPassword }); // Tworzenie nowego użytkownika
    res.status(201).json(user); // Zwrócenie odpowiedzi z nowym użytkownikiem
  } catch (error) {
    res.status(500).json({ error: error.message }); // Obsługa błędów
  }
});

// Trasa do logowania użytkownika
router.post('/login', [
  body('username').notEmpty(), // Walidacja: username nie może być pusty
  body('password').notEmpty() // Walidacja: password nie może być pusty
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Zwrócenie błędów walidacji
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ where: { username } }); // Znalezienie użytkownika po username
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' }); // Sprawdzenie poprawności username
    }

    const isMatch = await bcrypt.compare(password, user.password); // Porównanie hasła
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' }); // Sprawdzenie poprawności hasła
    }

    const token = jwt.sign({ userId: user.id }, 'your_jwt_secret', { expiresIn: '1h' }); // Generowanie tokenu JWT
    res.json({ token }); // Zwrócenie tokenu
  } catch (error) {
    res.status(500).json({ error: error.message }); // Obsługa błędów
  }
});

// Trasa do pobierania danych o COVID-19
router.get('/fetch-covid-data', async (req, res) => {
  try {
    const response = await axios.get('https://api.covid19api.com/summary'); // Pobieranie danych z API
    const data = response.data.Global;
    const newData = await Data.create({
      confirmed: data.TotalConfirmed,
      deaths: data.TotalDeaths,
      recovered: data.TotalRecovered,
      date: new Date()
    }); // Tworzenie nowego wpisu w bazie danych
    res.status(200).json(newData); // Zwrócenie danych
  } catch (error) {
    res.status(500).json({ error: error.message }); // Obsługa błędów
  }
});

// Trasa do tworzenia wpisów danych
router.post('/data', [
  body('confirmed').isInt(), // Walidacja: confirmed musi być liczbą całkowitą
  body('deaths').isInt(), // Walidacja: deaths musi być liczbą całkowitą
  body('recovered').isInt(), // Walidacja: recovered musi być liczbą całkowitą
  body('date').isISO8601() // Walidacja: date musi być datą w formacie ISO 8601
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() }); // Zwrócenie błędów walidacji
  }
  try {
    const newData = await Data.create(req.body); // Tworzenie nowego wpisu w bazie danych
    res.status(201).json(newData); // Zwrócenie nowego wpisu
  } catch (error) {
    res.status(500).json({ error: error.message }); // Obsługa błędów
  }
});

// Middleware weryfikujący token
function authMiddleware(req, res, next) {
  const token = req.header('Authorization').replace('Bearer ', ''); // Pobieranie tokenu z nagłówka
  try {
    const decoded = jwt.verify(token, 'secret'); // Weryfikacja tokenu
    req.user = decoded; // Przypisanie zweryfikowanego użytkownika do requestu
    next(); // Przejście do następnego middleware
  } catch (error) {
    res.status(401).send('Unauthorized'); // Zwrócenie odpowiedzi nieautoryzowanej
  }
}

// Przykład rejestracji użytkownika (zduplikowana trasa, niepotrzebna)
router.post('/register', async (req, res) => {
  const hashedPassword = await bcrypt.hash(req.body.password, 8); // Hashowanie hasła
  const user = await User.create({ ...req.body, password: hashedPassword }); // Tworzenie nowego użytkownika
  const token = jwt.sign({ userId: user.id }, 'secret', { expiresIn: '1h' }); // Generowanie tokenu JWT
  res.status(201).json({ user, token }); // Zwrócenie nowego użytkownika i tokenu
});

// Trasa do tworzenia wpisów w transakcji
router.post('/data-transaction', async (req, res) => {
  const t = await sequelize.transaction(); // Rozpoczęcie transakcji
  try {
    const newData = await Data.create(req.body, { transaction: t }); // Tworzenie nowego wpisu w transakcji
    await t.commit(); // Zatwierdzenie transakcji
    res.status(201).json(newData); // Zwrócenie nowego wpisu
  } catch (error) {
    await t.rollback(); // Wycofanie transakcji w przypadku błędu
    res.status(500).json({ error: error.message }); // Obsługa błędów
  }
});

// Eksportowanie routera
module.exports = router;
