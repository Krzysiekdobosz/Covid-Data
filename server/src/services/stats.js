const { Op } = require('sequelize');
const { Vaccination, Hospitalization } = require('../db');
const { toWeekly, latestValues, filterRange } = require('./series');

const VACCINATION_FIELDS = [
  'totalVaccinations',
  'peopleVaccinated',
  'peopleFullyVaccinated',
  'totalBoosters',
  'dailyVaccinations',
  'peopleVaccinatedPerHundred',
  'peopleFullyVaccinatedPerHundred',
  'totalBoostersPerHundred',
  'dailyVaccinationsPerMillion',
];

// OWID indicator names mapped to short keys used by the API.
const HOSPITAL_INDICATORS = {
  'Daily ICU occupancy': 'icuOccupancy',
  'Daily ICU occupancy per million': 'icuOccupancyPerMillion',
  'Daily hospital occupancy': 'hospitalOccupancy',
  'Daily hospital occupancy per million': 'hospitalOccupancyPerMillion',
  'Weekly new hospital admissions': 'weeklyHospitalAdmissions',
  'Weekly new hospital admissions per million': 'weeklyHospitalAdmissionsPerMillion',
  'Weekly new ICU admissions': 'weeklyIcuAdmissions',
  'Weekly new ICU admissions per million': 'weeklyIcuAdmissionsPerMillion',
};
const HOSPITAL_FIELDS = Object.values(HOSPITAL_INDICATORS);

// Regions and income groups published by Our World in Data.
const isAggregate = (isoCode) => isoCode.startsWith('OWID_') && !['OWID_KOS', 'OWID_CYN'].includes(isoCode);

let countriesCache = null;

async function listCountries() {
  if (countriesCache) return countriesCache;

  const [rows, hospitalCodes] = await Promise.all([
    Vaccination.findAll({
      attributes: ['isoCode', 'location', 'date', ...VACCINATION_FIELDS],
      order: [['isoCode', 'ASC'], ['date', 'ASC']],
      raw: true,
    }),
    Hospitalization.findAll({ attributes: ['isoCode'], group: ['isoCode'], raw: true }),
  ]);

  const withHospitalData = new Set(hospitalCodes.map((row) => row.isoCode));
  const byCountry = new Map();
  for (const row of rows) {
    if (!byCountry.has(row.isoCode)) byCountry.set(row.isoCode, []);
    byCountry.get(row.isoCode).push(row);
  }

  countriesCache = [...byCountry.entries()]
    .map(([isoCode, countryRows]) => ({
      isoCode,
      name: countryRows[0].location,
      type: isAggregate(isoCode) ? 'region' : 'country',
      hasHospitalData: withHospitalData.has(isoCode),
      latest: latestValues(countryRows, VACCINATION_FIELDS),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return countriesCache;
}

async function findCountry(isoCode) {
  const countries = await listCountries();
  return countries.find((c) => c.isoCode === isoCode.toUpperCase()) || null;
}

async function vaccinationSeries(isoCode, { interval = 'week', from, to } = {}) {
  const rows = await Vaccination.findAll({
    attributes: ['date', ...VACCINATION_FIELDS],
    where: { isoCode: isoCode.toUpperCase() },
    order: [['date', 'ASC']],
    raw: true,
  });
  const ranged = filterRange(rows, { from, to });
  return interval === 'day' ? ranged : toWeekly(ranged, VACCINATION_FIELDS);
}

async function hospitalizationSeries(isoCode, { interval = 'week', from, to } = {}) {
  const rows = await Hospitalization.findAll({
    attributes: ['date', 'indicator', 'value'],
    where: { isoCode: isoCode.toUpperCase(), indicator: { [Op.in]: Object.keys(HOSPITAL_INDICATORS) } },
    order: [['date', 'ASC']],
    raw: true,
  });

  // Long format (date, indicator, value) -> one row per date.
  const byDate = new Map();
  for (const { date, indicator, value } of rows) {
    const row = byDate.get(date) || { date };
    row[HOSPITAL_INDICATORS[indicator]] = value;
    byDate.set(date, row);
  }
  const daily = filterRange([...byDate.values()], { from, to }).map((row) => {
    for (const field of HOSPITAL_FIELDS) if (!(field in row)) row[field] = null;
    return row;
  });

  return interval === 'day' ? daily : toWeekly(daily, HOSPITAL_FIELDS);
}

async function summary() {
  const countries = await listCountries();
  const world = countries.find((c) => c.isoCode === 'OWID_WRL') || null;
  const ranked = countries
    // Values above 100% come from small territories that also vaccinated non-residents.
    .filter((c) => c.type === 'country' && c.latest.peopleFullyVaccinatedPerHundred !== null && c.latest.peopleFullyVaccinatedPerHundred <= 100)
    .sort((a, b) => b.latest.peopleFullyVaccinatedPerHundred - a.latest.peopleFullyVaccinatedPerHundred);

  const pick = ({ isoCode, name, latest }) => ({
    isoCode,
    name,
    peopleFullyVaccinatedPerHundred: latest.peopleFullyVaccinatedPerHundred,
    peopleVaccinatedPerHundred: latest.peopleVaccinatedPerHundred,
  });

  return {
    world,
    countriesCount: countries.filter((c) => c.type === 'country').length,
    top: ranked.slice(0, 10).map(pick),
    bottom: ranked.slice(-10).reverse().map(pick),
    regions: countries.filter((c) => c.type === 'region').map(({ isoCode, name, latest }) => ({ isoCode, name, latest })),
  };
}

const clearCache = () => {
  countriesCache = null;
};

module.exports = {
  VACCINATION_FIELDS,
  HOSPITAL_FIELDS,
  HOSPITAL_INDICATORS,
  listCountries,
  findCountry,
  vaccinationSeries,
  hospitalizationSeries,
  summary,
  clearCache,
};
