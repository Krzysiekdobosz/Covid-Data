export const Spinner = () => (
  <div className="spinner" role="status">
    <span className="sr-only">Loading…</span>
  </div>
);

export const ErrorMessage = ({ children }) => (children ? <div className="error" role="alert">{children}</div> : null);

export const Stat = ({ label, value, hint }) => (
  <div className="stat card">
    <span className="stat__label">{label}</span>
    <strong className="stat__value">{value}</strong>
    {hint && <span className="stat__hint">{hint}</span>}
  </div>
);

export const ProgressBar = ({ value }) => (
  <div className="progress" aria-hidden="true">
    <span style={{ width: `${Math.min(100, Math.max(0, value ?? 0))}%` }} />
  </div>
);
