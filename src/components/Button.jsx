import { Link } from 'react-router';

export default function Button({
  children,
  to,
  variant = 'primary',
  className = '',
  busy = false,
  disabled = false,
  ...props
}) {
  const classes = `button button-${variant} ${className}`;
  if (to)
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  return (
    <button
      type="button"
      className={classes}
      disabled={disabled || busy}
      aria-busy={busy}
      {...props}
    >
      {busy ? <span className="spinner small" /> : null}
      {children}
    </button>
  );
}
