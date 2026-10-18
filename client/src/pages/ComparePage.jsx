import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { LineChart, PALETTE } from '../components/LineChart';
import { ErrorMessage, Spinner } from '../components/ui';
import { METRICS } from '../utils/format';

const MAX_COUNTRIES = 6;
const DEFAULT_CODES = ['POL', 'DEU', 'GBR', 'USA'];

export const ComparePage = () => {
  const [params, setParams] = useSearchParams();
  const codes = (params.get('c') || DEFAULT_CODES.join(',')).split(',').filter(Boolean);
  const metric = METRICS[params.get('m')] ? params.get('m') : 'peopleFullyVaccinatedPerHundred';
  const [candidate, setCandidate] = useState('');

  const countries = useAsync(() => api.countries(), []);
  const [series, setSeries] = useState({});
  const [error, setError] = useState('');

  useEffect(() => {
    codes.filter((code) => !series[code]).forEach((code) => {
      api.vaccinations(code)
        .then((rows) => setSeries((prev) => ({ ...prev, [code]: rows })))
        .catch((err) => setError(err.message));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [codes.join(',')]);

  const update = (nextCodes, nextMetric = metric) => setParams({ c: nextCodes.join(','), m: nextMetric }, { replace: true });

  const add = (e) => {
    e.preventDefault();
    if (candidate && !codes.includes(candidate) && codes.length < MAX_COUNTRIES) update([...codes, candidate]);
    setCandidate('');
  };

  if (countries.loading) return <Spinner />;
  const nameOf = (code) => countries.data.find((c) => c.isoCode === code)?.name ?? code;
  const ready = codes.filter((code) => series[code]);

  return (
    <>
      <div className="page-header">
        <h1>Compare countries</h1>
        <p className="muted">Pick up to {MAX_COUNTRIES} locations and a metric.</p>
      </div>

      <div className="toolbar card">
        <form className="toolbar__group" onSubmit={add}>
          <select value={candidate} onChange={(e) => setCandidate(e.target.value)} aria-label="Country to add">
            <option value="">Add a country…</option>
            {countries.data.filter((c) => !codes.includes(c.isoCode)).map((c) => (
              <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
            ))}
          </select>
          <button type="submit" className="btn btn--primary" disabled={!candidate || codes.length >= MAX_COUNTRIES}>Add</button>
        </form>
        <select value={metric} onChange={(e) => update(codes, e.target.value)} aria-label="Metric">
          {Object.entries(METRICS).map(([key, m]) => (
            <option key={key} value={key}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="chips">
        {codes.map((code, i) => (
          <span key={code} className="chip" style={{ borderColor: PALETTE[i % PALETTE.length] }}>
            <span className="chip__dot" style={{ background: PALETTE[i % PALETTE.length] }} />
            {nameOf(code)}
            <button type="button" aria-label={`Remove ${nameOf(code)}`} onClick={() => update(codes.filter((c) => c !== code))}>×</button>
          </span>
        ))}
      </div>

      <ErrorMessage>{error}</ErrorMessage>
      <section className="card">
        <h2>{METRICS[metric].label}</h2>
        {ready.length ? (
          <LineChart
            height={420}
            series={codes.map((code) => ({
              label: nameOf(code),
              data: (series[code] || []).map((r) => ({ date: r.date, value: r[metric] })),
            }))}
          />
        ) : codes.length ? (
          <Spinner />
        ) : (
          <p className="empty">Add a country to start comparing.</p>
        )}
      </section>
    </>
  );
};
