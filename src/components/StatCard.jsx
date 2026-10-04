import Icon from './Icon.jsx';

export default function StatCard({ label, value, icon, tone = 'blue' }) {
  return (
    <div className="stat-card">
      <span className={`stat-icon ${tone}`}>
        <Icon name={icon} />
      </span>
      <div>
        <span className="muted">{label}</span>
        <p className="stat-value">
          {value}
          <small>개</small>
        </p>
      </div>
    </div>
  );
}
