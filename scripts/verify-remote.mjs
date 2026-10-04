import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const url = process.env.VITE_SUPABASE_URL;
const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key?.startsWith('sb_publishable_')) {
  console.error('.env.local에 Project URL과 publishable key를 먼저 설정해 주세요.');
  process.exit(1);
}
const createTestClient = () =>
  createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      fetch: (input, init = {}) => fetch(input, { ...init, signal: AbortSignal.timeout(15000) }),
    },
  });
const owner = createTestClient();
const other = createTestClient();
let recordId;
let cleanupFailed = false;

try {
  const signedIn = await owner.auth.signInAnonymously();
  if (signedIn.error) throw signedIn.error;
  const secondSignIn = await other.auth.signInAnonymously();
  if (secondSignIn.error) throw secondSignIn.error;
  const payload = {
    user_id: signedIn.data.user.id,
    title: '[자동 검증] 배움노트 임시 기록',
    content: '검증 종료 시 삭제되는 임시 데이터입니다.',
    topic: 'React',
    status: 'learning',
    learned_on: '2026-01-01',
  };
  const inserted = await owner.from('learning_records').insert(payload).select().single();
  if (inserted.error) throw inserted.error;
  recordId = inserted.data.id;
  console.log('PASS: 원격 등록');

  const listed = await owner.from('learning_records').select('id').eq('id', recordId);
  if (listed.error) throw listed.error;
  assert.equal(listed.data.length, 1);
  const detail = await owner.from('learning_records').select().eq('id', recordId).single();
  if (detail.error) throw detail.error;
  assert.equal(detail.data.title, payload.title);
  console.log('PASS: 원격 목록 및 상세 조회');

  const updated = await owner
    .from('learning_records')
    .update({ title: '[자동 검증] 수정 완료', status: 'done' })
    .eq('id', recordId)
    .select()
    .single();
  if (updated.error) throw updated.error;
  assert.equal(updated.data.status, 'done');
  const reread = await owner.from('learning_records').select().eq('id', recordId).single();
  if (reread.error) throw reread.error;
  assert.equal(reread.data.title, '[자동 검증] 수정 완료');
  console.log('PASS: 원격 수정 및 재조회');

  for (const operation of ['read', 'update', 'delete']) {
    let query = other.from('learning_records');
    if (operation === 'read') query = query.select('id');
    if (operation === 'update') query = query.update({ title: '허용되면 안 되는 수정' });
    if (operation === 'delete') query = query.delete();
    query = query.eq('id', recordId);
    if (operation !== 'read') query = query.select('id');
    const result = await query;
    if (result.error) throw result.error;
    assert.deepEqual(result.data, [], `다른 사용자의 ${operation}이 차단되어야 합니다.`);
  }
  // 다른 소유자로 insert를 시도해 RLS의 WITH CHECK도 검증한다.
  const forbidden = await other.from('learning_records').insert(payload).select('id');
  if (!forbidden.error && forbidden.data?.length) {
    await owner
      .from('learning_records')
      .delete()
      .in(
        'id',
        forbidden.data.map((row) => row.id),
      );
  }
  assert.ok(forbidden.error, '다른 사용자 소유의 행 생성을 차단해야 합니다.');
  console.log('PASS: 다른 사용자의 조회·수정·삭제·소유자 위조 차단');

  const removed = await owner.from('learning_records').delete().eq('id', recordId).select('id');
  if (removed.error) throw removed.error;
  assert.equal(removed.data.length, 1);
  const absent = await owner.from('learning_records').select('id').eq('id', recordId);
  if (absent.error) throw absent.error;
  assert.deepEqual(absent.data, []);
  recordId = null;
  console.log('PASS: 원격 삭제 및 삭제 후 재조회');
} catch (error) {
  console.error('FAIL:', error.code ?? error.name ?? 'request_error', error.message);
  process.exitCode = 1;
} finally {
  if (recordId) {
    const { error } = await owner.from('learning_records').delete().eq('id', recordId);
    cleanupFailed = Boolean(error);
  }
  owner.auth.stopAutoRefresh();
  other.auth.stopAutoRefresh();
  if (cleanupFailed) {
    console.error(
      '임시 기록 정리에 실패했습니다. Table Editor에서 [자동 검증] 기록을 확인해 주세요.',
    );
    process.exitCode = 1;
  }
}
