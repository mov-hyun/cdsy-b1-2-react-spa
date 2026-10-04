import RecordCard from './RecordCard.jsx';

export default function RecordList({ records }) {
  return (
    <div className="record-grid">
      {records.map((record) => (
        <RecordCard key={record.id} record={record} />
      ))}
    </div>
  );
}
