import { test, expect } from '@playwright/test';

const firstId = '11111111-1111-4111-8111-111111111111';
const secondId = '22222222-2222-4222-8222-222222222222';
const example = {
  id: firstId,
  title: 'useState로 화면 바꾸기',
  content: '이벤트에서 상태를 변경하면 React가 화면을 다시 렌더링한다.',
  topic: 'React',
  status: 'learning',
  learned_on: '2026-01-01',
  created_at: '2026-01-01T12:00:00Z',
  updated_at: '2026-01-01T12:00:00Z',
};

// 이 fixture는 브라우저 UI 검증 전용이다. 앱에는 모의 저장소가 없다.
async function mockBackend(page, initial = []) {
  const state = {
    rows: structuredClone(initial),
    failRead: false,
    failWrite: false,
    failDelete: false,
    delay: 0,
    posts: 0,
    authCalls: 0,
  };
  await page.route('https://fonts.googleapis.com/**', (route) => route.abort());
  await page.route('https://fonts.gstatic.com/**', (route) => route.abort());
  await page.route('https://learning-test.supabase.co/auth/v1/**', async (route) => {
    state.authCalls++;
    const payload = Buffer.from(
      JSON.stringify({
        sub: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
        exp: Math.floor(Date.now() / 1000) + 3600,
        role: 'authenticated',
        is_anonymous: true,
      }),
    ).toString('base64url');
    await route.fulfill({
      json: {
        access_token: `eyJhbGciOiJIUzI1NiJ9.${payload}.test`,
        refresh_token: 'test-refresh',
        token_type: 'bearer',
        expires_in: 3600,
        user: {
          id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
          aud: 'authenticated',
          role: 'authenticated',
          is_anonymous: true,
        },
      },
    });
  });
  await page.route(
    'https://learning-test.supabase.co/rest/v1/learning_records**',
    async (route) => {
      const method = route.request().method();
      if (state.delay) await new Promise((resolve) => setTimeout(resolve, state.delay));
      if (
        (method === 'GET' && state.failRead) ||
        (['POST', 'PATCH'].includes(method) && state.failWrite) ||
        (method === 'DELETE' && state.failDelete)
      ) {
        await route.fulfill({
          status: 500,
          json: { message: 'Test request failed', code: 'XX000' },
        });
        return;
      }
      const id = new URL(route.request().url()).searchParams.get('id')?.replace('eq.', '');
      if (method === 'GET') {
        await route.fulfill({ json: id ? state.rows.filter((row) => row.id === id) : state.rows });
      } else if (method === 'POST') {
        state.posts++;
        const row = { ...example, ...route.request().postDataJSON(), id: firstId };
        state.rows.push(row);
        await route.fulfill({ status: 201, json: row });
      } else if (method === 'PATCH') {
        const row = state.rows.find((row) => row.id === id);
        Object.assign(row, route.request().postDataJSON());
        await route.fulfill({ json: row });
      } else if (method === 'DELETE') {
        const deleted = state.rows.filter((row) => row.id === id);
        state.rows = state.rows.filter((row) => row.id !== id);
        await route.fulfill({ json: deleted.map(({ id }) => ({ id })) });
      } else await route.fulfill({ status: 405 });
    },
  );
  return state;
}

test('전체 CRUD: 유효성, 미리보기, 중복 제출 방지, 재접속, 수정, 삭제', async ({ page }) => {
  const failures = [];
  page.on('pageerror', (error) => failures.push(error.message));
  const api = await mockBackend(page);
  await page.goto('/');
  await expect(page.getByText('첫 번째 배움을 남겨 보세요')).toBeVisible();
  expect(api.authCalls).toBe(1);
  await page.getByRole('link', { name: '오늘의 배움 기록하기' }).click();
  await page.getByRole('button', { name: '기록 저장' }).click();
  await expect(page.getByText('제목을 입력해 주세요.')).toBeVisible();
  await expect(page.getByText('배운 내용을 입력해 주세요.')).toBeVisible();
  expect(api.posts).toBe(0);
  await page.getByLabel('제목', { exact: false }).fill('React의 상태 흐름');
  await page.getByLabel('배운 내용', { exact: false }).fill('상태가 바뀌면 화면이 바뀐다.');
  await expect(page.locator('.preview-card h3')).toHaveText('React의 상태 흐름');
  api.delay = 250;
  await page.getByRole('button', { name: '기록 저장' }).click();
  await expect(page.getByRole('button', { name: '저장 중…' })).toBeDisabled();
  await expect(page).toHaveURL(new RegExp(`/records/${firstId}$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('React의 상태 흐름');
  await expect(page.getByText('새로운 배움을 기록했어요.')).toBeVisible();
  expect(api.posts).toBe(1);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('React의 상태 흐름');
  await page.getByRole('link', { name: '수정', exact: true }).click();
  await page.getByLabel('제목', { exact: false }).fill('React의 상태 흐름 복습');
  await page.getByLabel('학습 상태', { exact: true }).selectOption('done');
  await page.getByRole('button', { name: '수정 저장' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('React의 상태 흐름 복습');
  await expect(page.locator('.detail-meta')).toContainText('이해 완료');
  await page.getByRole('button', { name: '삭제', exact: true }).click();
  await page.getByRole('button', { name: '취소', exact: true }).click();
  expect(api.rows).toHaveLength(1);
  await page.getByRole('button', { name: '삭제', exact: true }).click();
  await page.getByRole('button', { name: '삭제하기', exact: true }).click();
  await expect(page).toHaveURL(/\/records$/);
  await expect(page.getByText('첫 번째 배움을 남겨 보세요')).toBeVisible();
  expect(api.rows).toHaveLength(0);
  expect(failures).toEqual([]);
});

test('로딩, 요청 실패, 재시도, 검색·필터·정렬과 검색 빈 상태', async ({ page }) => {
  const api = await mockBackend(page, [
    example,
    {
      ...example,
      id: secondId,
      title: 'CSS Grid 익히기',
      topic: 'HTML / CSS',
      status: 'done',
      learned_on: '2026-01-02',
    },
  ]);
  api.delay = 350;
  api.failRead = true;
  await page.goto('/records');
  await expect(page.getByText('기록을 불러오고 있어요.')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('요청을 완료하지 못했습니다.');
  api.failRead = false;
  await page.getByRole('button', { name: '다시 시도', exact: true }).click();
  await expect(page.locator('.record-card')).toHaveCount(2);
  await expect(page.locator('.record-card').first()).toContainText('CSS Grid');
  await page.getByLabel('정렬 순서').selectOption('oldest');
  await expect(page.locator('.record-card').first()).toContainText('useState');
  await page.getByLabel('기록 검색', { exact: true }).fill('useState');
  await expect(page.locator('.record-card')).toHaveCount(1);
  await page.getByRole('button', { name: '이해 완료', exact: true }).click();
  await expect(page.getByText('검색 결과가 없어요')).toBeVisible();
  await page.getByRole('button', { name: '필터 초기화' }).click();
  await page.getByLabel('주제 필터').selectOption('HTML / CSS');
  await expect(page.locator('.record-card')).toHaveCount(1);
  await expect(page.locator('.record-card')).toContainText('CSS Grid');
});

test('저장·삭제 실패 시 입력과 기록을 보존하며 재시도한다', async ({ page }) => {
  const api = await mockBackend(page, [example]);
  await page.goto(`/records/${firstId}/edit`);
  await page.getByLabel('제목', { exact: false }).fill('실패 후에도 남는 제목');
  api.failWrite = true;
  await page.getByRole('button', { name: '수정 저장' }).click();
  await expect(page.getByRole('alert')).toContainText('입력한 내용은 유지돼요.');
  await expect(page.getByLabel('제목', { exact: false })).toHaveValue('실패 후에도 남는 제목');
  api.failWrite = false;
  await page.getByRole('button', { name: '수정 저장' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('실패 후에도 남는 제목');
  api.failDelete = true;
  await page.getByRole('button', { name: '삭제', exact: true }).click();
  await page.getByRole('button', { name: '삭제하기', exact: true }).click();
  await expect(page.getByRole('dialog').getByRole('alert')).toBeVisible();
  expect(api.rows).toHaveLength(1);
  api.failDelete = false;
  await page.getByRole('button', { name: '삭제하기', exact: true }).click();
  await expect(page).toHaveURL(/\/records$/);
  expect(api.rows).toHaveLength(0);
});

test('없는 기록, 잘못된 ID, 알 수 없는 주소, 이용 안내', async ({ page }) => {
  await mockBackend(page);
  for (const path of [`/records/${secondId}`, '/records/bad-id', `/records/${secondId}/edit`]) {
    await page.goto(path);
    await expect(page.getByRole('heading', { name: '기록을 찾을 수 없어요' })).toBeVisible();
  }
  await page.goto('/does-not-exist');
  await expect(page.getByText('404 · PAGE NOT FOUND')).toBeVisible();
  await page.getByRole('link', { name: '이용 안내', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('배움노트 이용 안내');
});

test('작은 화면에서도 폼과 탐색이 동작하고 HTML을 텍스트로 렌더링한다', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockBackend(page, [
    { ...example, title: '<img src=x onerror=alert(1)>', content: '<script>alert(1)</script>' },
  ]);
  await page.goto('/records');
  await expect(page.locator('.record-card')).toHaveCount(1);
  await page.locator('.record-card').click();
  await expect(page.locator('.detail-content')).toHaveText('<script>alert(1)</script>');
  await expect(page.locator('.detail-content script')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.getByRole('link', { name: '새 기록 작성', exact: true }).click();
  await expect(page.getByRole('button', { name: '기록 저장' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
  await page.screenshot({
    path: 'test-results/mobile-form.png',
    fullPage: true,
    animations: 'disabled',
  });
});

test('대시보드 시각 점검용 화면', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1040 });
  await mockBackend(page, [
    example,
    {
      ...example,
      id: secondId,
      title: '컴포넌트를 나누는 기준',
      content: '한 가지 역할에 집중하고 반복되는 UI는 재사용한다.',
      status: 'review',
    },
    {
      ...example,
      id: '33333333-3333-4333-8333-333333333333',
      title: '배열을 다루는 map과 filter',
      content: '원본을 바꾸지 않고 새로운 배열을 만든다.',
      topic: 'JavaScript',
      status: 'done',
    },
  ]);
  await page.goto('/');
  await expect(page.locator('.record-card')).toHaveCount(3);
  await page.screenshot({
    path: 'test-results/dashboard.png',
    fullPage: true,
    animations: 'disabled',
  });
});
