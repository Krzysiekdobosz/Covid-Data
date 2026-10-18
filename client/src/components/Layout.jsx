import { Link, NavLink, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { isStatic } from '../api';

export const Layout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="app">
      <header className="topbar">
        <div className="container topbar__inner">
          <Link to="/" className="brand">
            <span className="brand__dot" /> CovidData
          </Link>
          <nav className="nav">
            <NavLink to="/" end>Overview</NavLink>
            <NavLink to="/countries">Countries</NavLink>
            <NavLink to="/compare">Compare</NavLink>
            {user && <NavLink to="/watchlist">Watchlist</NavLink>}
          </nav>
          <div className="account">
            {user ? (
              <>
                <span className="muted">{user.username}</span>
                <button type="button" className="btn btn--ghost" onClick={logout}>Log out</button>
              </>
            ) : (
              <Link to="/login" className="btn btn--primary">Log in</Link>
            )}
          </div>
        </div>
      </header>

      <main className="container main">
        <Outlet />
      </main>

      <footer className="footer container">
        <span>Data: Our World in Data – COVID-19 vaccinations and hospitalisations (until May 2024).</span>
        {isStatic && <span>Demo version – statistics are served from static JSON files.</span>}
      </footer>
    </div>
  );
};
