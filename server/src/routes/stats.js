const express = require('express');
const { query } = require('express-validator');
const stats = require('../services/stats');
const { HttpError, asyncHandler, validate } = require('../middleware');

const router = express.Router();

const seriesQuery = [
  query('interval').optional().isIn(['day', 'week']).withMessage('interval must be "day" or "week"'),
  query('from').optional().isISO8601().withMessage('from must be a date (YYYY-MM-DD)'),
  query('to').optional().isISO8601().withMessage('to must be a date (YYYY-MM-DD)'),
];

const findCountry = async (isoCode) => {
  const country = await stats.findCountry(isoCode);
  if (!country) throw new HttpError(404, `Unknown country code: ${isoCode}`);
  return country;
};

router.get('/summary', asyncHandler(async (req, res) => {
  res.json(await stats.summary());
}));

router.get('/countries', asyncHandler(async (req, res) => {
  const { type } = req.query;
  const countries = await stats.listCountries();
  res.json(type ? countries.filter((c) => c.type === type) : countries);
}));

router.get('/countries/:isoCode', asyncHandler(async (req, res) => {
  res.json(await findCountry(req.params.isoCode));
}));

router.get('/countries/:isoCode/vaccinations', seriesQuery, validate, asyncHandler(async (req, res) => {
  const country = await findCountry(req.params.isoCode);
  res.json(await stats.vaccinationSeries(country.isoCode, req.query));
}));

router.get('/countries/:isoCode/hospitalizations', seriesQuery, validate, asyncHandler(async (req, res) => {
  const country = await findCountry(req.params.isoCode);
  res.json(await stats.hospitalizationSeries(country.isoCode, req.query));
}));

module.exports = router;
