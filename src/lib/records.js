export const TOPICS = ['React', 'JavaScript', 'HTML / CSS', '웹 기초', '기타'];
export const STATUSES = {
  learning: { label: '학습 중', color: 'blue' },
  review: { label: '복습 예정', color: 'amber' },
  done: { label: '이해 완료', color: 'green' },
};

export function today() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function validateRecord(values) {
  const errors = {};
  if (!values.title.trim()) errors.title = '제목을 입력해 주세요.';
  else if (values.title.trim().length > 100) errors.title = '제목은 100자 이내로 적어 주세요.';
  if (!values.content.trim()) errors.content = '배운 내용을 입력해 주세요.';
  else if (values.content.trim().length > 10000)
    errors.content = '내용은 10,000자 이내로 적어 주세요.';
  if (!TOPICS.includes(values.topic)) errors.topic = '학습 주제를 선택해 주세요.';
  if (!Object.hasOwn(STATUSES, values.status)) errors.status = '학습 상태를 선택해 주세요.';
  const date = new Date(`${values.learned_on}T00:00:00Z`);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(values.learned_on) ||
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== values.learned_on
  ) {
    errors.learned_on = '올바른 학습 날짜를 입력해 주세요.';
  } else if (values.learned_on > today())
    errors.learned_on = '오늘 또는 이전 날짜를 선택해 주세요.';
  return errors;
}

export function recordPayload(values) {
  return {
    title: values.title.trim(),
    content: values.content.trim(),
    topic: values.topic,
    status: values.status,
    learned_on: values.learned_on,
  };
}

export function filterRecords(
  records,
  { query = '', status = 'all', topic = 'all', sort = 'newest' } = {},
) {
  const keyword = query.trim().toLocaleLowerCase();
  return records
    .filter(
      (record) =>
        (status === 'all' || record.status === status) &&
        (topic === 'all' || record.topic === topic) &&
        `${record.title} ${record.content}`.toLocaleLowerCase().includes(keyword),
    )
    .sort((a, b) => {
      const result =
        a.learned_on.localeCompare(b.learned_on) ||
        a.created_at.localeCompare(b.created_at) ||
        a.id.localeCompare(b.id);
      return sort === 'oldest' ? result : -result;
    });
}

export function formatDate(value) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`));
}
