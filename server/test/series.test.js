const test = require('node:test');
const assert = require('node:assert');
const { weekStart, toWeekly, latestValues, filterRange } = require('../src/services/series');

test('weekStart returns the Monday of the ISO week', () => {
  assert.strictEqual(weekStart('2021-03-03'), '2021-03-01');
  assert.strictEqual(weekStart('2021-03-07'), '2021-03-01');
  assert.strictEqual(weekStart('2021-03-08'), '2021-03-08');
});

test('toWeekly keeps the last non-empty value of each week', () => {
  const rows = [
    { date: '2021-03-01', total: 10, rate: 1 },
    { date: '2021-03-03', total: 15, rate: null },
    { date: '2021-03-08', total: null, rate: 3 },
  ];
  assert.deepStrictEqual(toWeekly(rows, ['total', 'rate']), [
    { date: '2021-03-01', total: 15, rate: 1 },
    { date: '2021-03-08', total: null, rate: 3 },
  ]);
});

test('latestValues finds the most recent value per field with its date', () => {
  const rows = [
    { date: '2021-01-01', a: 1, b: 5 },
    { date: '2021-02-01', a: 2, b: null },
  ];
  assert.deepStrictEqual(latestValues(rows, ['a', 'b']), { a: 2, aDate: '2021-02-01', b: 5, bDate: '2021-01-01' });
});

test('filterRange limits rows to the given dates', () => {
  const rows = [{ date: '2021-01-01' }, { date: '2021-06-01' }, { date: '2022-01-01' }];
  assert.deepStrictEqual(filterRange(rows, { from: '2021-02-01', to: '2021-12-31' }), [{ date: '2021-06-01' }]);
});
