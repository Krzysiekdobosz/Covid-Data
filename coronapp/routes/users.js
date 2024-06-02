/**
 * Ten plik definiuje prostą trasę dla ścieżki '/users'.
 * Jest to router Express, który obsługuje żądania GET i zwraca odpowiedź.
 */

var express = require('express');
var router = express.Router();

/* GET users listing. */
// Trasa GET dla ścieżki '/users', która zwraca prostą odpowiedź tekstową
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

// Eksportowanie routera
module.exports = router;
