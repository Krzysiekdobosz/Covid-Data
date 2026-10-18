// Writes the API responses as JSON files used by the static demo on GitHub Pages.
const fs = require('fs');
const path = require('path');
const { sequelize } = require('../src/db');
const stats = require('../src/services/stats');

const OUT_DIR = path.join(__dirname, '..', '..', 'client', 'public', 'data');

const write = (file, data) => {
  const target = path.join(OUT_DIR, file);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(data));
};

// Rounds floats to keep the files small.
const compact = (rows) =>
  rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key, typeof value === 'number' ? Math.round(value * 100) / 100 : value]))
  );

(async () => {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });

  const countries = await stats.listCountries();
  write('countries.json', countries);
  write('summary.json', await stats.summary());

  for (const country of countries) {
    write(`vaccinations/${country.isoCode}.json`, compact(await stats.vaccinationSeries(country.isoCode)));
    if (country.hasHospitalData) {
      write(`hospitalizations/${country.isoCode}.json`, compact(await stats.hospitalizationSeries(country.isoCode)));
    }
  }

  console.log(`Exported data for ${countries.length} locations to ${OUT_DIR}`);
  await sequelize.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
