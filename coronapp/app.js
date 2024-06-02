/**
 * Ten plik jest głównym plikiem aplikacji Express.
 * Ustawia on silnik widoków, middleware do logowania, parsowania żądań i obsługi ciasteczek,
 * oraz definiuje ścieżki routingu dla aplikacji. Dodatkowo, obsługuje błędy, w tym błędy 404 i inne błędy serwera.
 */

// Importowanie modułu http-errors do obsługi błędów HTTP
var createError = require('http-errors');
// Importowanie modułu express, który jest frameworkiem aplikacji webowej dla Node.js
var express = require('express');
// Importowanie modułu path do obsługi i tworzenia ścieżek plików
var path = require('path');
// Importowanie modułu cookie-parser do obsługi ciasteczek HTTP
var cookieParser = require('cookie-parser');
// Importowanie modułu morgan do logowania żądań HTTP
var logger = require('morgan');

// Importowanie routera dla głównej ścieżki
var indexRouter = require('./routes/index');
// Importowanie routera dla ścieżki /users
var usersRouter = require('./routes/users');

// Inicjalizacja aplikacji express
var app = express();

// Konfiguracja silnika widoków
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Middleware do logowania żądań
app.use(logger('dev'));
// Middleware do parsowania JSON
app.use(express.json());
// Middleware do parsowania URL encoded
app.use(express.urlencoded({ extended: false }));
// Middleware do obsługi ciasteczek
app.use(cookieParser());
// Middleware do serwowania plików statycznych
app.use(express.static(path.join(__dirname, 'public')));

// Definicja ścieżek routingu
app.use('/', indexRouter);
app.use('/users', usersRouter);

// Middleware do obsługi błędów 404
app.use(function(req, res, next) {
  next(createError(404));
});

// Middleware do obsługi innych błędów
app.use(function(err, req, res, next) {
  // Ustawienie zmiennych lokalnych tylko w trybie developerskim
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Renderowanie strony błędu
  res.status(err.status || 500);
  res.render('error');
});

// Eksportowanie aplikacji
module.exports = app;
