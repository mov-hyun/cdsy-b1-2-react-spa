import { STATUSES } from '../lib/records.js';

export default function Badge({ status }) {
  const item = STATUSES[status] ?? STATUSES.learning;
  return (
    <span className={`badge badge-${item.color}`}>
      <span />
      {item.label}
    </span>
  );
}
