import test from 'node:test';
import assert from 'node:assert/strict';
import { filterRecords, recordPayload, today, validateRecord } from '../src/lib/records.js';

const valid = {
  title: ' React 상태 ',
  content: ' 입력이 화면으로 이어진다. ',
  topic: 'React',
  status: 'learning',
  learned_on: '2026-01-01',
};

test('빈 값과 공백만 있는 필수 입력을 거부한다', () => {
  assert.deepEqual(Object.keys(validateRecord({ ...valid, title: '  ', content: '\n ' })), [
    'title',
    'content',
  ]);
});
test('길이 한계에서 허용하고 초과하면 거부한다', () => {
  assert.deepEqual(
    validateRecord({ ...valid, title: '가'.repeat(100), content: '나'.repeat(10000) }),
    {},
  );
  assert.equal(
    Object.keys(validateRecord({ ...valid, title: '가'.repeat(101), content: '나'.repeat(10001) }))
      .length,
    2,
  );
});
test('존재하지 않는 날짜, 미래 날짜, 허용되지 않은 분류를 거부한다', () => {
  for (const learned_on of ['', 'invalid', '2026-02-30', '2099-12-31'])
    assert.ok(validateRecord({ ...valid, learned_on }).learned_on);
  assert.ok(validateRecord({ ...valid, topic: '임의 주제', status: '__proto__' }).status);
  assert.ok(validateRecord({ ...valid, topic: '임의 주제' }).topic);
  assert.deepEqual(validateRecord({ ...valid, learned_on: today() }), {});
});
test('저장 데이터는 필수 필드만 포함하고 공백을 정리한다', () => {
  const result = recordPayload({ ...valid, id: '변경 금지', user_id: '변경 금지' });
  assert.equal(result.title, 'React 상태');
  assert.equal(result.content, '입력이 화면으로 이어진다.');
  assert.equal(Object.hasOwn(result, 'user_id'), false);
  assert.equal(Object.hasOwn(result, 'id'), false);
});
test('검색, 주제, 상태를 함께 적용하고 원본 배열을 변경하지 않는다', () => {
  const records = [
    { ...valid, id: 'a', title: 'REACT hooks', created_at: '2026-01-01' },
    { ...valid, id: 'b', title: 'React props', status: 'done', created_at: '2026-01-02' },
    { ...valid, id: 'c', topic: 'JavaScript', created_at: '2026-01-03' },
  ];
  const original = structuredClone(records);
  assert.deepEqual(
    filterRecords(records, { query: ' react ', status: 'learning', topic: 'React' }).map(
      (row) => row.id,
    ),
    ['a'],
  );
  assert.deepEqual(
    filterRecords(records).map((row) => row.id),
    ['c', 'b', 'a'],
  );
  assert.deepEqual(
    filterRecords(records, { sort: 'oldest' }).map((row) => row.id),
    ['a', 'b', 'c'],
  );
  assert.deepEqual(records, original);
});
