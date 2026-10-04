import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
function validProjectUrl(value) {
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
}
// 새 프로젝트의 브라우저용 publishable key만 허용한다.
// 관리자용 secret/service_role 키는 클라이언트에 사용하지 않는다.
export const isConfigured = Boolean(validProjectUrl(url) && key?.startsWith('sb_publishable_'));

export const supabase = isConfigured
  ? createClient(url, key, {
      global: {
        fetch: (input, init = {}) =>
          fetch(input, {
            ...init,
            signal: init.signal
              ? AbortSignal.any([init.signal, AbortSignal.timeout(15000)])
              : AbortSignal.timeout(15000),
          }),
      },
    })
  : null;

let sessionRequest;

// StrictMode의 두 번 실행에서도 익명 계정을 중복 생성하지 않는다.
export function ensureSession() {
  if (!supabase)
    return Promise.reject(
      new Error('Supabase 연결 설정이 필요합니다. 이용 안내의 연결 방법을 확인해 주세요.'),
    );
  if (!sessionRequest) {
    sessionRequest = (async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      if (data.session) return data.session;
      const result = await supabase.auth.signInAnonymously();
      if (result.error) throw result.error;
      if (!result.data.session) throw new Error('학습 공간을 열지 못했습니다. 다시 시도해 주세요.');
      return result.data.session;
    })().finally(() => {
      sessionRequest = null;
    });
  }
  return sessionRequest;
}

export function errorMessage(error) {
  if (!isConfigured)
    return 'Supabase 연결 설정이 필요합니다. 이용 안내의 연결 방법을 확인해 주세요.';
  if (/anonymous/i.test(error?.message ?? ''))
    return '학습 공간을 열지 못했습니다. Supabase에서 익명 로그인을 활성화해 주세요.';
  if (error?.code === '42501')
    return '이 기록에 접근할 권한이 없습니다. 연결 설정을 확인해 주세요.';
  if (error?.code === 'PGRST205' || error?.code === '42P01')
    return '기록 테이블이 준비되지 않았습니다. Supabase에서 설정 SQL을 실행해 주세요.';
  return '요청을 완료하지 못했습니다. 인터넷 연결을 확인하고 다시 시도해 주세요.';
}
