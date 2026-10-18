import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { ErrorMessage, ProgressBar, Spinner } from '../components/ui';
import { formatCompact, formatPercent } from '../utils/format';

const COLUMNS = [
  { key: 'name', label: 'Country' },
  { key: 'peopleVaccinatedPerHundred', label: 'One dose', numeric: true },
  { key: 'peopleFullyVaccinatedPerHundred', label: 'Fully vaccinated', numeric: true },
  { key: 'totalBoostersPerHundred', label: 'Boosters / 100', numeric: true },
  { key: 'totalVaccinations', label: 'Doses', numeric: true },
];

export const CountriesPage = () => {
  const { data, error, loading } = useAsync(() => api.countries(), []);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ key: 'peopleFullyVaccinatedPerHundred', dir: -1 });
  const [showRegions, setShowRegions] = useState(false);

  const rows = useMemo(() => {
    if (!data) return [];
    const term = search.trim().toLowerCase();
    const value = (c) => (sort.key === 'name' ? c.name : c.latest[sort.key]);
    return data
      .filter((c) => (showRegions ? c.type === 'region' : c.type === 'country'))
      .filter((c) => !term || c.name.toLowerCase().includes(term) || c.isoCode.toLowerCase() === term)
      .sort((a, b) => {
        const va = value(a);
        const vb = value(b);
        if (va === null || va === undefined) return 1;
        if (vb === null || vb === undefined) return -1;
        return (typeof va === 'string' ? va.localeCompare(vb) : va - vb) * sort.dir;
      });
  }, [data, search, sort, showRegions]);

  const toggleSort = (key) =>
    setSort((prev) => ({ key, dir: prev.key === key ? -prev.dir : key === 'name' ? 1 : -1 }));

  if (loading) return <Spinner />;
  if (error) return <ErrorMessage>{error}</ErrorMessage>;

  return (
    <>
      <div className="page-header">
        <h1>Countries</h1>
        <p className="muted">Latest available vaccination figures. Click a column to sort.</p>
      </div>

      <div className="toolbar card">
        <input
          type="search"
          placeholder="Search country or ISO code…"
          aria-label="Search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="segmented" role="group" aria-label="Location type">
          <button type="button" className={!showRegions ? 'active' : ''} onClick={() => setShowRegions(false)}>Countries</button>
          <button type="button" className={showRegions ? 'active' : ''} onClick={() => setShowRegions(true)}>Regions</button>
        </div>
      </div>

      <div className="card table-wrap">
        <table className="table table--sortable">
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} className={col.numeric ? 'num' : ''}>
                  <button type="button" onClick={() => toggleSort(col.key)}>
                    {col.label}
                    {sort.key === col.key && <span aria-hidden="true">{sort.dir === 1 ? ' ↑' : ' ↓'}</span>}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.isoCode}>
                <td><Link to={`/countries/${c.isoCode}`}>{c.name}</Link></td>
                <td className="num">{formatPercent(c.latest.peopleVaccinatedPerHundred)}</td>
                <td className="num">
                  <div className="cell-bar">
                    <ProgressBar value={c.latest.peopleFullyVaccinatedPerHundred} />
                    {formatPercent(c.latest.peopleFullyVaccinatedPerHundred)}
                  </div>
                </td>
                <td className="num">{c.latest.totalBoostersPerHundred?.toFixed(1) ?? '—'}</td>
                <td className="num">{formatCompact(c.latest.totalVaccinations)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!rows.length && <p className="empty">No locations match your search.</p>}
      </div>
    </>
  );
};
