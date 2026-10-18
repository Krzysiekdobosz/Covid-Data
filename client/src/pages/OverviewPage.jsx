import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAsync } from '../hooks/useAsync';
import { LineChart, BarChart } from '../components/LineChart';
import { ErrorMessage, ProgressBar, Spinner, Stat } from '../components/ui';
import { formatCompact, formatDate, formatPercent } from '../utils/format';

const CONTINENTS = ['OWID_EUR', 'OWID_NAM', 'OWID_SAM', 'OWID_ASI', 'OWID_OCE', 'OWID_AFR'];

const RankingTable = ({ title, rows }) => (
  <section className="card">
    <h2>{title}</h2>
    <table className="table">
      <tbody>
        {rows.map((row, i) => (
          <tr key={row.isoCode}>
            <td className="muted">{i + 1}</td>
            <td><Link to={`/countries/${row.isoCode}`}>{row.name}</Link></td>
            <td className="table__bar"><ProgressBar value={row.peopleFullyVaccinatedPerHundred} /></td>
            <td className="num">{formatPercent(row.peopleFullyVaccinatedPerHundred)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
);

export const OverviewPage = () => {
  const summary = useAsync(() => api.summary(), []);
  const world = useAsync(() => api.vaccinations('OWID_WRL'), []);

  if (summary.loading) return <Spinner />;
  if (summary.error) return <ErrorMessage>{summary.error}</ErrorMessage>;

  const { world: w, top, bottom, regions, countriesCount } = summary.data;
  const continents = CONTINENTS.map((code) => regions.find((r) => r.isoCode === code)).filter(Boolean);

  return (
    <>
      <div className="page-header">
        <h1>COVID-19 vaccinations worldwide</h1>
        <p className="muted">
          {countriesCount} countries · data up to {formatDate(w.latest.totalVaccinationsDate)}
        </p>
      </div>

      <div className="stats">
        <Stat label="Doses administered" value={formatCompact(w.latest.totalVaccinations)} />
        <Stat label="At least one dose" value={formatPercent(w.latest.peopleVaccinatedPerHundred)} hint="of world population" />
        <Stat label="Fully vaccinated" value={formatPercent(w.latest.peopleFullyVaccinatedPerHundred)} hint="of world population" />
        <Stat label="Booster doses" value={formatCompact(w.latest.totalBoosters)} />
      </div>

      <section className="card">
        <h2>Vaccination progress in the world</h2>
        {world.loading ? (
          <Spinner />
        ) : (
          <LineChart
            fill
            yLabel="% of population"
            series={[
              { label: 'At least one dose', data: world.data.map((r) => ({ date: r.date, value: r.peopleVaccinatedPerHundred })) },
              { label: 'Fully vaccinated', data: world.data.map((r) => ({ date: r.date, value: r.peopleFullyVaccinatedPerHundred })) },
              { label: 'Boosters per 100', data: world.data.map((r) => ({ date: r.date, value: r.totalBoostersPerHundred })) },
            ]}
          />
        )}
      </section>

      <section className="card">
        <h2>Fully vaccinated by continent</h2>
        <BarChart
          height={260}
          label="% fully vaccinated"
          labels={continents.map((c) => c.name)}
          values={continents.map((c) => c.latest.peopleFullyVaccinatedPerHundred)}
        />
      </section>

      <div className="grid-2">
        <RankingTable title="Highest coverage" rows={top} />
        <RankingTable title="Lowest coverage" rows={bottom} />
      </div>
    </>
  );
};
