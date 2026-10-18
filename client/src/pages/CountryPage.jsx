import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { useAuth } from '../components/AuthContext';
import { LineChart } from '../components/LineChart';
import { ErrorMessage, Spinner, Stat } from '../components/ui';
import { formatCompact, formatDate, formatNumber, formatPercent } from '../utils/format';

const pick = (rows, field) => rows.map((r) => ({ date: r.date, value: r[field] }));
const peakOf = (rows, field) => Math.max(0, ...rows.map((r) => r[field] ?? 0));

export const CountryPage = () => {
  const { isoCode } = useParams();
  const { user, watchlist, toggleWatch } = useAuth();
  const countries = useAsync(() => api.countries(), []);
  const vaccinations = useAsync(() => api.vaccinations(isoCode), [isoCode]);
  const country = countries.data?.find((c) => c.isoCode === isoCode.toUpperCase());
  const hospitals = useAsync(
    () => (country?.hasHospitalData ? api.hospitalizations(isoCode) : Promise.resolve(null)),
    [isoCode, country?.hasHospitalData]
  );

  if (countries.loading) return <Spinner />;
  if (!country) return <ErrorMessage>Unknown location: {isoCode}</ErrorMessage>;

  const { latest } = country;
  const watched = watchlist.some((c) => c.isoCode === country.isoCode);

  return (
    <>
      <Link to="/countries" className="back">&larr; All countries</Link>
      <div className="page-header page-header--row">
        <div>
          <h1>{country.name}</h1>
          <p className="muted">Latest data: {formatDate(latest.totalVaccinationsDate)}</p>
        </div>
        {user ? (
          <button type="button" className={`btn ${watched ? 'btn--ghost' : 'btn--primary'}`} onClick={() => toggleWatch(country.isoCode)}>
            {watched ? '★ On watchlist' : '☆ Add to watchlist'}
          </button>
        ) : (
          <Link to="/login" className="btn btn--ghost">Log in to watch</Link>
        )}
      </div>

      <div className="stats">
        <Stat label="Doses administered" value={formatCompact(latest.totalVaccinations)} />
        <Stat label="At least one dose" value={formatPercent(latest.peopleVaccinatedPerHundred)} />
        <Stat label="Fully vaccinated" value={formatPercent(latest.peopleFullyVaccinatedPerHundred)} />
        <Stat label="Boosters per 100" value={latest.totalBoostersPerHundred?.toFixed(1) ?? '—'} />
      </div>

      <ErrorMessage>{vaccinations.error}</ErrorMessage>
      {vaccinations.loading ? (
        <Spinner />
      ) : vaccinations.data && (
        <div className="grid-2">
          <section className="card">
            <h2>Vaccination coverage</h2>
            <LineChart
              yLabel="% of population"
              series={[
                { label: 'At least one dose', data: pick(vaccinations.data, 'peopleVaccinatedPerHundred') },
                { label: 'Fully vaccinated', data: pick(vaccinations.data, 'peopleFullyVaccinatedPerHundred') },
                { label: 'Boosters per 100', data: pick(vaccinations.data, 'totalBoostersPerHundred') },
              ]}
            />
          </section>
          <section className="card">
            <h2>Daily doses (7-day average)</h2>
            <LineChart fill yLabel="doses per day" series={[{ label: 'Daily doses', data: pick(vaccinations.data, 'dailyVaccinations') }]} />
          </section>
        </div>
      )}

      {country.hasHospitalData && (
        <section className="card">
          <h2>Hospital and ICU occupancy</h2>
          {hospitals.loading ? (
            <Spinner />
          ) : hospitals.data && (
            <>
              <LineChart
                yLabel="patients"
                series={[
                  { label: 'Patients in hospital', field: 'hospitalOccupancy' },
                  { label: 'Patients in ICU', field: 'icuOccupancy', color: '#dc2626' },
                ]
                  .filter((s) => peakOf(hospitals.data, s.field) > 0)
                  .map((s) => ({ ...s, data: pick(hospitals.data, s.field) }))}
              />
              {peakOf(hospitals.data, 'hospitalOccupancy') > 0 && (
                <p className="muted small">
                  Peak hospital occupancy: {formatNumber(peakOf(hospitals.data, 'hospitalOccupancy'))} patients
                </p>
              )}
            </>
          )}
        </section>
      )}
    </>
  );
};
