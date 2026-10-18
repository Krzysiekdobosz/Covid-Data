const number = new Intl.NumberFormat('en-US');
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const date = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatNumber = (value) => (value === null || value === undefined ? '—' : number.format(Math.round(value)));
export const formatCompact = (value) => (value === null || value === undefined ? '—' : compact.format(value));
export const formatPercent = (value) => (value === null || value === undefined ? '—' : `${value.toFixed(1)}%`);
export const formatDate = (value) => (value ? date.format(new Date(value)) : '—');

export const METRICS = {
  peopleVaccinatedPerHundred: { label: 'At least one dose (% of population)', format: formatPercent },
  peopleFullyVaccinatedPerHundred: { label: 'Fully vaccinated (% of population)', format: formatPercent },
  totalBoostersPerHundred: { label: 'Booster doses per 100 people', format: (v) => (v === null || v === undefined ? '—' : v.toFixed(1)) },
  dailyVaccinationsPerMillion: { label: 'Daily doses per million', format: formatNumber },
};
