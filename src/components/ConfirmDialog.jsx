import { useEffect, useRef } from 'react';
import Button from './Button.jsx';

export default function ConfirmDialog({ open, title, children, busy, error, onCancel, onConfirm }) {
  const ref = useRef(null);
  useEffect(() => {
    if (open && !ref.current.open) ref.current.showModal();
    if (!open && ref.current.open) ref.current.close();
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-labelledby="confirm-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
    >
      <h2 id="confirm-title">{title}</h2>
      <div className="dialog-copy">{children}</div>
      {error ? (
        <p className="inline-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="actions dialog-actions">
        <Button variant="secondary" onClick={onCancel} disabled={busy} autoFocus>
          취소
        </Button>
        <Button variant="danger" onClick={onConfirm} busy={busy}>
          {busy ? '삭제 중…' : '삭제하기'}
        </Button>
      </div>
    </dialog>
  );
}
