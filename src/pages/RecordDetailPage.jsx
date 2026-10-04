import { useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import Badge from '../components/Badge.jsx';
import Button from '../components/Button.jsx';
import Icon from '../components/Icon.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { AsyncContent, EmptyState } from '../components/States.jsx';
import { useToast } from '../components/ToastProvider.jsx';
import { useRecords } from '../hooks/useRecords.js';
import { formatDate } from '../lib/records.js';
import { deleteRecord } from '../lib/recordsApi.js';
import { errorMessage } from '../lib/supabase.js';

export default function RecordDetailPage() {
  const { id } = useParams();
  const request = useRecords(id);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const deleting = useRef(false);
  const navigate = useNavigate();
  const notify = useToast();
  async function remove() {
    if (deleting.current) return;
    deleting.current = true;
    setBusy(true);
    setError('');
    try {
      await deleteRecord(id);
      notify('기록을 삭제했어요.');
      navigate('/records', { replace: true });
    } catch (failure) {
      setError(errorMessage(failure));
    } finally {
      deleting.current = false;
      setBusy(false);
    }
  }
  return (
    <>
      <Button to="/records" variant="quiet" className="back-link">
        ← 모든 기록
      </Button>
      <AsyncContent request={request}>
        {(record) =>
          record ? (
            <>
              <article className="detail-panel">
                <div className="detail-meta">
                  <span className="topic">{record.topic}</span>
                  <Badge status={record.status} />
                </div>
                <h1>{record.title}</h1>
                <p className="muted">
                  <time dateTime={record.learned_on}>{formatDate(record.learned_on)}</time>에 배운
                  내용
                </p>
                <div className="detail-content">{record.content}</div>
                <div className="detail-footer">
                  <span className="muted">나의 배움, 나의 기록</span>
                  <div className="actions">
                    <Button to={`/records/${id}/edit`} variant="secondary">
                      <Icon name="edit" size={17} />
                      수정
                    </Button>
                    <Button
                      variant="quiet-danger"
                      onClick={() => {
                        setError('');
                        setOpen(true);
                      }}
                    >
                      <Icon name="trash" size={17} />
                      삭제
                    </Button>
                  </div>
                </div>
              </article>
              <div className="detail-tip">
                <Icon name="book" />
                <p>
                  다시 읽으며 이해가 깊어졌다면 학습 상태를 <strong>이해 완료</strong>로 바꿔
                  보세요.
                </p>
              </div>
              <ConfirmDialog
                open={open}
                title="이 기록을 삭제할까요?"
                busy={busy}
                error={error}
                onCancel={() => setOpen(false)}
                onConfirm={remove}
              >
                <p>“{record.title}” 기록이 영구적으로 삭제됩니다.</p>
                <p>삭제한 기록은 되돌릴 수 없어요.</p>
              </ConfirmDialog>
            </>
          ) : (
            <EmptyState
              title="기록을 찾을 수 없어요"
              description="삭제되었거나 이 학습 공간에 없는 기록입니다."
              action="목록으로 돌아가기"
              to="/records"
            />
          )
        }
      </AsyncContent>
    </>
  );
}
