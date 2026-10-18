import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { ProgressBar } from '../components/ui';
import { formatCompact, formatPercent } from '../utils/format';

export const WatchlistPage = () => {
  const { user, watchlist, toggleWatch } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  return (
    <>
      <div className="page-header page-header--row">
        <div>
          <h1>Your watchlist</h1>
          <p className="muted">Countries you follow, {user.username}.</p>
        </div>
        {watchlist.length > 1 && (
          <Link to={`/compare?c=${watchlist.map((c) => c.isoCode).join(',')}`} className="btn btn--primary">
            Compare all
          </Link>
        )}
      </div>

      {watchlist.length ? (
        <div className="cards">
          {watchlist.map((c) => (
            <article key={c.isoCode} className="card country-card">
              <div className="country-card__head">
                <Link to={`/countries/${c.isoCode}`}><h2>{c.name}</h2></Link>
                <button type="button" className="link" onClick={() => toggleWatch(c.isoCode)}>Remove</button>
              </div>
              <p className="muted small">Fully vaccinated</p>
              <div className="cell-bar">
                <ProgressBar value={c.latest.peopleFullyVaccinatedPerHundred} />
                <strong>{formatPercent(c.latest.peopleFullyVaccinatedPerHundred)}</strong>
              </div>
              <p className="muted small">
                {formatCompact(c.latest.totalVaccinations)} doses · {formatPercent(c.latest.peopleVaccinatedPerHundred)} with at least one dose
              </p>
            </article>
          ))}
        </div>
      ) : (
        <p className="card empty">
          Your watchlist is empty. Open a <Link to="/countries">country</Link> and add it to the watchlist.
        </p>
      )}
    </>
  );
};
