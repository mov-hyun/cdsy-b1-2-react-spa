import { useCallback, useEffect, useState } from 'react';
import { fetchRecord, fetchRecords } from '../lib/recordsApi.js';
import { errorMessage } from '../lib/supabase.js';

// id가 없으면 목록, 있으면 상세. 원격 데이터와 요청 상태는 이 훅이 소유한다.
export function useRecords(id) {
  const [request, setRequest] = useState({ key: id, data: null, status: 'loading', error: '' });
  const [revision, setRevision] = useState(0);
  const retry = useCallback(() => setRevision((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setRequest({ key: id, data: null, status: 'loading', error: '' });
    const promise =
      id === undefined ? fetchRecords(controller.signal) : fetchRecord(id, controller.signal);
    promise
      .then((data) => {
        if (active) setRequest({ key: id, data, status: 'success', error: '' });
      })
      .catch((error) => {
        if (active)
          setRequest({ key: id, data: null, status: 'error', error: errorMessage(error) });
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [id, revision]);

  // 파라미터가 바뀐 직후 이전 기록이 잠깐 노출되는 것도 막는다.
  return {
    ...(request.key === id ? request : { data: null, status: 'loading', error: '' }),
    retry,
  };
}
