const express = require('express');
const { WatchlistItem } = require('../db');
const stats = require('../services/stats');
const { HttpError, asyncHandler, authenticate } = require('../middleware');

const router = express.Router();

router.use(authenticate);

const listFor = async (user) => {
  const items = await WatchlistItem.findAll({ where: { UserId: user.id }, order: [['createdAt', 'ASC']] });
  const countries = await stats.listCountries();
  return items
    .map((item) => countries.find((c) => c.isoCode === item.isoCode))
    .filter(Boolean);
};

router.get('/', asyncHandler(async (req, res) => {
  res.json(await listFor(req.user));
}));

router.post('/', asyncHandler(async (req, res) => {
  const country = await stats.findCountry(String(req.body.isoCode || ''));
  if (!country) throw new HttpError(404, 'Unknown country code');

  await WatchlistItem.findOrCreate({ where: { UserId: req.user.id, isoCode: country.isoCode } });
  res.status(201).json(await listFor(req.user));
}));

router.delete('/:isoCode', asyncHandler(async (req, res) => {
  await WatchlistItem.destroy({ where: { UserId: req.user.id, isoCode: req.params.isoCode.toUpperCase() } });
  res.json(await listFor(req.user));
}));

module.exports = router;
