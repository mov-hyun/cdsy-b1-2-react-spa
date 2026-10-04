import { Link } from 'react-router';
import Badge from './Badge.jsx';
import Icon from './Icon.jsx';
import { formatDate } from '../lib/records.js';

export default function RecordCard({ record }) {
  return (
    <Link to={`/records/${record.id}`} className="record-card">
      <div className="card-top">
        <span className="topic">{record.topic}</span>
        <Badge status={record.status} />
      </div>
      <h3>{record.title}</h3>
      <p className="record-excerpt">{record.content}</p>
      <div className="card-bottom">
        <time dateTime={record.learned_on}>{formatDate(record.learned_on)}</time>
        <Icon name="arrow" size={18} />
      </div>
    </Link>
  );
}
