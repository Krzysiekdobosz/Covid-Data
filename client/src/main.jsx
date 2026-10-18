import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './components/AuthContext';
import { Layout } from './components/Layout';
import { OverviewPage } from './pages/OverviewPage';
import { CountriesPage } from './pages/CountriesPage';
import { CountryPage } from './pages/CountryPage';
import { ComparePage } from './pages/ComparePage';
import { AuthPage } from './pages/AuthPage';
import { WatchlistPage } from './pages/WatchlistPage';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<OverviewPage />} />
            <Route path="countries" element={<CountriesPage />} />
            <Route path="countries/:isoCode" element={<CountryPage />} />
            <Route path="compare" element={<ComparePage />} />
            <Route path="login" element={<AuthPage />} />
            <Route path="watchlist" element={<WatchlistPage />} />
            <Route path="*" element={<p className="card empty">Page not found.</p>} />
          </Route>
        </Routes>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
