import { ensureSession, supabase } from './supabase.js';
import { recordPayload, validateRecord } from './records.js';

const columns = 'id,title,content,topic,status,learned_on,created_at,updated_at';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function fetchRecords(signal) {
  await ensureSession();
  // range를 나눠 읽어 Supabase의 기본 1,000행 제한으로 목록이 잘리지 않게 한다.
  const records = [];
  for (let from = 0; ; from += 500) {
    const { data, error } = await supabase
      .from('learning_records')
      .select(columns)
      .order('created_at', { ascending: false })
      .order('id')
      .range(from, from + 499)
      .abortSignal(signal);
    if (error) throw error;
    records.push(...data);
    if (data.length < 500) return records;
  }
}

export async function fetchRecord(id, signal) {
  if (!uuid.test(id)) return null;
  await ensureSession();
  const { data, error } = await supabase
    .from('learning_records')
    .select(columns)
    .eq('id', id)
    .abortSignal(signal)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveRecord(values, id) {
  if (Object.keys(validateRecord(values)).length) throw new Error('입력값을 확인해 주세요.');
  const session = await ensureSession();
  const payload = recordPayload(values);
  const query = id
    ? supabase.from('learning_records').update(payload).eq('id', id)
    : supabase.from('learning_records').insert({ ...payload, user_id: session.user.id });
  const { data, error } = await query.select(columns).single();
  if (error) throw error;
  return data;
}

export async function deleteRecord(id) {
  await ensureSession();
  const { data, error } = await supabase
    .from('learning_records')
    .delete()
    .eq('id', id)
    .select('id');
  if (error) throw error;
  if (!data.length) throw new Error('기록을 삭제할 수 없습니다.');
}
