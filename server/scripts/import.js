const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { sequelize, Vaccination, Hospitalization } = require('../src/db');

const BATCH_SIZE = 2000;
const DATA_DIR = path.join(__dirname, '..', 'data');

const toNumber = (value) => (value === undefined || value === '' ? null : Number(value));

const mapVaccination = (row) => ({
  isoCode: row.iso_code,
  location: row.location,
  date: row.date,
  totalVaccinations: toNumber(row.total_vaccinations),
  peopleVaccinated: toNumber(row.people_vaccinated),
  peopleFullyVaccinated: toNumber(row.people_fully_vaccinated),
  totalBoosters: toNumber(row.total_boosters),
  dailyVaccinations: toNumber(row.daily_vaccinations),
  peopleVaccinatedPerHundred: toNumber(row.people_vaccinated_per_hundred),
  peopleFullyVaccinatedPerHundred: toNumber(row.people_fully_vaccinated_per_hundred),
  totalBoostersPerHundred: toNumber(row.total_boosters_per_hundred),
  dailyVaccinationsPerMillion: toNumber(row.daily_vaccinations_per_million),
});

const mapHospitalization = (row) => ({
  isoCode: row.iso_code,
  location: row.entity,
  date: row.date,
  indicator: row.indicator,
  value: toNumber(row.value),
});

// Streams the CSV and waits for every batch insert before reading further.
async function importFile(fileName, model, mapRow) {
  const stream = fs.createReadStream(path.join(DATA_DIR, fileName)).pipe(csv());
  let batch = [];
  let total = 0;

  for await (const row of stream) {
    if (!row.iso_code || !row.date) continue;
    batch.push(mapRow(row));
    if (batch.length === BATCH_SIZE) {
      await model.bulkCreate(batch);
      total += batch.length;
      batch = [];
    }
  }
  if (batch.length) {
    await model.bulkCreate(batch);
    total += batch.length;
  }
  return total;
}

(async () => {
  console.time('import');
  await sequelize.sync({ force: true });
  const vaccinations = await importFile('vaccinations.csv', Vaccination, mapVaccination);
  const hospitalizations = await importFile('hospitalizations.csv', Hospitalization, mapHospitalization);
  console.log(`Imported ${vaccinations} vaccination rows and ${hospitalizations} hospitalisation rows.`);
  console.timeEnd('import');
  await sequelize.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
