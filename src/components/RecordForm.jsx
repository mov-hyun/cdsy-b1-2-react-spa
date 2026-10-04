import { useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { TOPICS, STATUSES, today, validateRecord } from '../lib/records.js';
import { saveRecord } from '../lib/recordsApi.js';
import { errorMessage } from '../lib/supabase.js';
import { useToast } from './ToastProvider.jsx';
import Button from './Button.jsx';
import Field from './Field.jsx';
import Badge from './Badge.jsx';
import Icon from './Icon.jsx';

export default function RecordForm({ initialRecord }) {
  const [values, setValues] = useState(
    () =>
      initialRecord ?? {
        title: '',
        content: '',
        topic: 'React',
        status: 'learning',
        learned_on: today(),
      },
  );
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failure, setFailure] = useState('');
  const form = useRef(null);
  const inFlight = useRef(false);
  const navigate = useNavigate();
  const notify = useToast();

  function change(event) {
    const next = { ...values, [event.target.name]: event.target.value };
    setValues(next);
    if (submitted) setErrors(validateRecord(next));
    setFailure('');
  }

  async function submit(event) {
    event.preventDefault();
    if (inFlight.current) return;
    const nextErrors = validateRecord(values);
    setSubmitted(true);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      form.current.elements.namedItem(Object.keys(nextErrors)[0])?.focus();
      return;
    }
    inFlight.current = true;
    setBusy(true);
    setFailure('');
    try {
      const record = await saveRecord(values, initialRecord?.id);
      notify(initialRecord ? '기록을 수정했어요.' : '새로운 배움을 기록했어요.');
      navigate(`/records/${record.id}`, { replace: true });
    } catch (error) {
      setFailure(errorMessage(error));
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <div className="form-layout">
      <form ref={form} className="form-panel" onSubmit={submit} noValidate aria-busy={busy}>
        <fieldset disabled={busy}>
          <div className="section-heading">
            <h2>배운 내용을 남겨 주세요</h2>
            <span className="muted">* 필수 항목</span>
          </div>
          <Field
            label="제목"
            name="title"
            required
            value={values.title}
            onChange={change}
            error={errors.title}
            maxLength={100}
            placeholder="오늘 무엇을 배웠나요?"
            hint={`${values.title.length} / 100자`}
          />
          <div className="field-row">
            <Field
              label="학습 주제"
              name="topic"
              as="select"
              value={values.topic}
              onChange={change}
              error={errors.topic}
            >
              {TOPICS.map((topic) => (
                <option key={topic}>{topic}</option>
              ))}
            </Field>
            <Field
              label="학습 날짜"
              name="learned_on"
              type="date"
              required
              max={today()}
              value={values.learned_on}
              onChange={change}
              error={errors.learned_on}
            />
          </div>
          <Field
            label="학습 상태"
            name="status"
            as="select"
            value={values.status}
            onChange={change}
            error={errors.status}
          >
            {Object.entries(STATUSES).map(([key, item]) => (
              <option value={key} key={key}>
                {item.label}
              </option>
            ))}
          </Field>
          <Field
            label="배운 내용"
            name="content"
            as="textarea"
            rows={12}
            required
            maxLength={10000}
            value={values.content}
            onChange={change}
            error={errors.content}
            placeholder={
              '새롭게 알게 된 것, 막혔던 부분, 기억하고 싶은 예제를 자유롭게 적어 보세요.'
            }
            hint={`${values.content.length.toLocaleString()} / 10,000자 · 일반 텍스트로 저장됩니다.`}
          />
        </fieldset>
        {failure ? (
          <p role="alert" className="inline-error">
            {failure} 입력한 내용은 유지돼요.
          </p>
        ) : null}
        <div className="form-actions">
          <Button
            variant="quiet"
            disabled={busy}
            onClick={() => navigate(initialRecord ? `/records/${initialRecord.id}` : '/records')}
          >
            취소
          </Button>
          <Button type="submit" busy={busy}>
            <Icon name="check" size={18} />
            {busy ? '저장 중…' : initialRecord ? '수정 저장' : '기록 저장'}
          </Button>
        </div>
      </form>
      <aside className="preview-panel">
        <p className="eyebrow">LIVE PREVIEW</p>
        <h2>이렇게 기록돼요</h2>
        <p className="muted">입력한 내용이 바로 반영됩니다.</p>
        <div className="preview-card">
          <div className="card-top">
            <span className="topic">{values.topic}</span>
            <Badge status={values.status} />
          </div>
          <h3>{values.title.trim() || '오늘의 배움 제목'}</h3>
          <p>
            {values.content.trim() ||
              '작은 발견부터 남겨 보세요. 나만의 학습 기록이 이곳에 쌓입니다.'}
          </p>
        </div>
        <div className="writing-tip">
          <Icon name="book" />
          <strong>기록을 더 잘 남기는 방법</strong>
          <p>
            무엇을 배웠는지, 어떻게 이해했는지,
            <br />
            다음에 무엇을 해볼지 적어 보세요.
          </p>
        </div>
      </aside>
    </div>
  );
}
