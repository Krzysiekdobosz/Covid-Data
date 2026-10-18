process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const { sequelize, Vaccination, Hospitalization } = require('../src/db');
const { clearCache } = require('../src/services/stats');
const app = require('../src/app');

test.before(async () => {
  await sequelize.sync({ force: true });
  await Vaccination.bulkCreate([
    { isoCode: 'POL', location: 'Poland', date: '2021-03-01', peopleFullyVaccinatedPerHundred: 5, totalVaccinations: 100 },
    { isoCode: 'POL', location: 'Poland', date: '2021-03-03', peopleFullyVaccinatedPerHundred: 6, totalVaccinations: 150 },
    { isoCode: 'POL', location: 'Poland', date: '2021-03-10', peopleFullyVaccinatedPerHundred: 8, totalVaccinations: 220 },
    { isoCode: 'DEU', location: 'Germany', date: '2021-03-10', peopleFullyVaccinatedPerHundred: 9, totalVaccinations: 900 },
    { isoCode: 'OWID_WRL', location: 'World', date: '2021-03-10', peopleFullyVaccinatedPerHundred: 3, totalVaccinations: 5000 },
  ]);
  await Hospitalization.bulkCreate([
    { isoCode: 'POL', location: 'Poland', date: '2021-03-01', indicator: 'Daily ICU occupancy', value: 2000 },
    { isoCode: 'POL', location: 'Poland', date: '2021-03-01', indicator: 'Daily hospital occupancy', value: 15000 },
  ]);
  clearCache();
});

test.after(() => sequelize.close());

test('lists countries with their latest values', async () => {
  const res = await request(app).get('/api/countries').expect(200);
  const poland = res.body.find((c) => c.isoCode === 'POL');
  assert.strictEqual(res.body.length, 3);
  assert.strictEqual(poland.latest.peopleFullyVaccinatedPerHundred, 8);
  assert.strictEqual(poland.hasHospitalData, true);
  assert.strictEqual(res.body.find((c) => c.isoCode === 'OWID_WRL').type, 'region');
});

test('returns a summary with the world and a ranking', async () => {
  const res = await request(app).get('/api/summary').expect(200);
  assert.strictEqual(res.body.world.isoCode, 'OWID_WRL');
  assert.deepStrictEqual(res.body.top.map((c) => c.isoCode), ['DEU', 'POL']);
});

test('returns weekly and daily vaccination series', async () => {
  const weekly = await request(app).get('/api/countries/pol/vaccinations').expect(200);
  assert.deepStrictEqual(weekly.body.map((r) => [r.date, r.totalVaccinations]), [['2021-03-01', 150], ['2021-03-08', 220]]);

  const daily = await request(app).get('/api/countries/POL/vaccinations?interval=day').expect(200);
  assert.strictEqual(daily.body.length, 3);
});

test('pivots hospitalisation indicators into columns', async () => {
  const res = await request(app).get('/api/countries/POL/hospitalizations').expect(200);
  assert.strictEqual(res.body[0].icuOccupancy, 2000);
  assert.strictEqual(res.body[0].hospitalOccupancy, 15000);
});

test('validates query parameters and unknown countries', async () => {
  await request(app).get('/api/countries/POL/vaccinations?interval=year').expect(422);
  await request(app).get('/api/countries/XYZ/vaccinations').expect(404);
});

test('registers, logs in and manages the watchlist', async () => {
  const register = await request(app).post('/api/auth/register').send({ username: 'anna', password: 'secret1' }).expect(201);
  await request(app).post('/api/auth/register').send({ username: 'anna', password: 'secret1' }).expect(409);
  await request(app).post('/api/auth/login').send({ username: 'anna', password: 'wrong-password' }).expect(401);

  const token = register.body.token;
  await request(app).get('/api/watchlist').expect(401);

  const added = await request(app).post('/api/watchlist').set('Authorization', `Bearer ${token}`).send({ isoCode: 'pol' }).expect(201);
  assert.deepStrictEqual(added.body.map((c) => c.isoCode), ['POL']);

  const removed = await request(app).delete('/api/watchlist/POL').set('Authorization', `Bearer ${token}`).expect(200);
  assert.deepStrictEqual(removed.body, []);
});
