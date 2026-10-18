import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { ErrorMessage } from '../components/ui';
import { isStatic } from '../api';

export const AuthPage = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e, credentials = form) => {
    e?.preventDefault();
    setBusy(true);
    setError('');
    try {
      await (mode === 'login' ? login : register)(credentials.username, credentials.password);
      navigate('/watchlist');
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  return (
    <section className="card auth">
      <div className="segmented" role="tablist">
        <button type="button" className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Log in</button>
        <button type="button" className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button>
      </div>

      <form className="form" onSubmit={submit}>
        <ErrorMessage>{error}</ErrorMessage>
        <label>
          Username
          <input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" required />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
          />
        </label>
        <button type="submit" className="btn btn--primary" disabled={busy}>
          {mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>

      {isStatic && mode === 'login' && (
        <p className="muted small">
          Demo account: <strong>demo</strong> / <strong>demo123</strong>{' '}
          <button type="button" className="link" onClick={() => submit(null, { username: 'demo', password: 'demo123' })}>
            Log in as demo
          </button>
        </p>
      )}
    </section>
  );
};
