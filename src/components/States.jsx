import Button from './Button.jsx';
import Icon from './Icon.jsx';

export function Loading({ message = '기록을 불러오고 있어요.' }) {
  return (
    <div className="state-panel" role="status">
      <span className="spinner" />
      <p>{message}</p>
      <span className="muted">잠시만 기다려 주세요.</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="state-panel error-panel" role="alert">
      <span className="state-icon">
        <Icon name="help" size={28} />
      </span>
      <h2>잠시 연결이 멈췄어요</h2>
      <p>{message}</p>
      <div className="actions">
        {onRetry ? (
          <Button onClick={onRetry} variant="secondary">
            다시 시도
          </Button>
        ) : null}
        <Button to="/guide" variant="quiet">
          이용 안내 <Icon name="arrow" size={16} />
        </Button>
      </div>
    </div>
  );
}

export function EmptyState({
  title = '첫 번째 배움을 남겨 보세요',
  description = '작은 발견도 좋아요. 오늘 배운 한 가지부터 시작해 보세요.',
  action,
  to,
  onAction,
}) {
  return (
    <div className="state-panel">
      <span className="state-icon">
        <Icon name="book" size={28} />
      </span>
      <h2>{title}</h2>
      <p>{description}</p>
      {action ? (
        <Button to={to} onClick={onAction}>
          {action}
        </Button>
      ) : null}
    </div>
  );
}

export function AsyncContent({ request, children }) {
  if (request.status === 'loading') return <Loading />;
  if (request.status === 'error')
    return <ErrorState message={request.error} onRetry={request.retry} />;
  return children(request.data);
}
