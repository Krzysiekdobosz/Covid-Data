// Pure helpers for time series, shared by the API and the static export.

// Monday of the ISO week for a YYYY-MM-DD date.
function weekStart(dateString) {
  const date = new Date(`${dateString}T00:00:00Z`);
  const day = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - day);
  return date.toISOString().slice(0, 10);
}

// Collapses daily rows into one row per week. For every field the last
// non-empty value of the week is kept, which works for cumulative totals
// and for smoothed daily rates alike.
function toWeekly(rows, fields) {
  const weeks = new Map();
  for (const row of rows) {
    const key = weekStart(row.date);
    const week = weeks.get(key) || { date: key };
    for (const field of fields) {
      if (row[field] !== null && row[field] !== undefined) week[field] = row[field];
    }
    weeks.set(key, week);
  }
  return [...weeks.values()].map((week) => {
    for (const field of fields) if (!(field in week)) week[field] = null;
    return week;
  });
}

// Latest non-empty value of each field in rows sorted by date.
function latestValues(rows, fields) {
  const latest = {};
  for (const field of fields) {
    for (let i = rows.length - 1; i >= 0; i--) {
      const value = rows[i][field];
      if (value !== null && value !== undefined) {
        latest[field] = value;
        latest[`${field}Date`] = rows[i].date;
        break;
      }
    }
    if (!(field in latest)) latest[field] = null;
  }
  return latest;
}

function filterRange(rows, { from, to } = {}) {
  return rows.filter((row) => (!from || row.date >= from) && (!to || row.date <= to));
}

module.exports = { weekStart, toWeekly, latestValues, filterRange };
