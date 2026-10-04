# 배움노트 · B1-2 React SPA

오늘 배운 내용을 기록하고 검색·복습하는 학습 기록장입니다. 단일 핵심 데이터인 **학습 기록**을 Supabase에 저장하며, React의 컴포넌트·상태·이벤트·비동기 렌더링을 학습하는 과제입니다.

- 소스: https://github.com/mov-hyun/cdsy-b1-2-react-spa
- 제출용 배포 URL: https://cdsy-b1-2-react-spa.vercel.app
- 현재 확인: 로컬 프로덕션 빌드, 단위 테스트 5개, 모의 API 브라우저 테스트 6개 통과.
- 2026-10-05 실제 Supabase 검증: 원격 CRUD, 삭제 후 재조회, 다른 사용자의 조회·수정·삭제 및 소유자 위조 차단 통과.
- 로컬 실제 브라우저: 등록·상세·수정·새로고침 후 유지 확인, 브라우저 오류 없음. [검증 기록](docs/verification-2026-10-05.md)
- 2026-10-05 배포 환경 검증: 실제 브라우저 등록·목록·상세·수정·삭제, 새로고침 후 유지, 삭제 후 재조회, Not Found 확인. 인증 쿠키 없는 HTTP 요청으로 주요 경로 접근 확인.
- Vercel Hobby에 CLI로 배포했습니다. GitHub 자동 배포 연결은 설정하지 않았으므로 이후 변경은 CLI로 다시 배포해야 합니다.

## 기술 스택

- React 19, JavaScript(ES modules), React Router 7
- Vite 7, 순수 CSS
- Supabase JavaScript SDK 2: PostgreSQL CRUD, 익명 인증, RLS
- Node.js 내장 테스트 러너, Playwright(Windows에서는 Microsoft Edge)
- Vercel용 SPA 경로 재작성 설정 포함

정확한 설치 버전은 `package-lock.json`에 고정합니다. Node.js 22.12 이상이 필요하며 Node.js 24에서 로컬 검증했습니다.

## 로컬 설치 및 실행

```bash
npm ci
```

`.env.example`을 `.env.local`로 복사합니다. PowerShell:

```powershell
Copy-Item .env.example .env.local
```

이미 `.env.local`에 연결 정보를 입력했다면 복사 명령으로 덮어쓰지 않습니다. 파일에 다음 두 값을 입력합니다.

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

```bash
npm run dev
```

기본 주소: http://127.0.0.1:5173

```bash
npm run build
npm run preview
```

환경변수가 없거나 형식이 맞지 않으면 조회 화면에 설정 안내가 표시됩니다. 가짜 기록이나 localStorage CRUD로 자동 전환하지 않습니다.

## Supabase 설정

1. [Supabase 대시보드](https://supabase.com/dashboard)에서 새 프로젝트를 만듭니다.
2. SQL Editor에서 [`supabase/schema.sql`](supabase/schema.sql) 전체를 실행합니다.
3. Authentication 설정에서 **Anonymous Sign-ins**를 활성화합니다.
4. 프로젝트 Connect 화면 또는 API 설정에서 Project URL과 **publishable key**(`sb_publishable_...`)를 확인합니다.
5. `.env.local`에 입력하고 개발 서버를 다시 시작합니다.
6. 웹에서 기록을 저장하고 Table Editor의 `learning_records`에 행이 생기는지 확인합니다.

이 앱은 새 publishable key 형식을 사용합니다. `sb_secret_...`, 레거시 `service_role` 키와 데이터베이스 비밀번호는 프론트엔드 환경변수에 넣지 않습니다. `.env*`는 Git에서 제외하고 빈 `.env.example`만 공유합니다.

Vite의 `VITE_` 환경변수는 빌드된 브라우저 코드에서 읽을 수 있습니다. publishable key는 브라우저용 공개 식별자이며 데이터 접근은 JWT와 RLS로 제한합니다. `.env` 분리만으로 비밀 키를 보호할 수는 없습니다.

### 익명 학습 공간

첫 요청에서 Supabase 익명 계정을 만들고 같은 브라우저의 세션을 재사용합니다. 별도 이메일·비밀번호 입력은 필요 없습니다. 원격 기록은 `user_id`로 구분하며 RLS가 자신의 기록에 대한 CRUD만 허용합니다. 핵심 데이터는 Supabase에 저장하고, 브라우저 저장소에는 SDK가 로그인 세션을 보관합니다.

브라우저 데이터를 지우거나 다른 기기를 사용하면 기존 익명 계정으로 돌아갈 수 없습니다. 이 제약을 앱의 이용 안내에도 표시합니다. 과제 공개 데모용 구성입니다. 장기 운영 시 영구 계정 전환, 익명 계정 정리, CAPTCHA와 남용 방지 설정을 검토해야 합니다.

## 기능과 라우트

| 경로                | 기능                                              |
| ------------------- | ------------------------------------------------- |
| `/`                 | 대시보드, 전체·복습·이해 완료 집계, 최근 기록     |
| `/records`          | 목록, 제목·내용 검색, 주제·상태 필터, 학습일 정렬 |
| `/records/new`      | 등록 폼, 필수값 검증, 입력 미리보기               |
| `/records/:id`      | URL 파라미터 기반 상세 조회, 삭제 확인            |
| `/records/:id/edit` | 원격 기록 조회 후 폼 수정                         |
| `/guide`            | 사용 방법, 익명 공간 제약, 연결 안내              |
| `*`                 | 잘못된 주소의 Not Found 화면                      |

삭제되었거나 접근할 수 없는 기록 및 잘못된 ID는 상세·수정 화면에서 찾을 수 없음 상태로 안내합니다. 목록·대시보드의 로딩·실패·빈 상태와 상세·수정의 로딩·실패·없는 기록 상태를 공통 컴포넌트로 처리합니다.

## 폴더 구조

```text
src/
  pages/          # 라우트 단위 화면 7개
  components/     # 버튼, 필드, 카드, 공통 상태, 폼, 레이아웃
  hooks/          # useRecords: 데이터 및 요청 상태
  lib/            # Supabase 연결, CRUD 함수, 검증·필터 유틸
  App.jsx         # 라우트 정의
  main.jsx        # StrictMode, BrowserRouter, ToastProvider
  styles.css      # 반응형 스타일, 전환 효과, reduced-motion 지원
supabase/schema.sql
scripts/verify-remote.mjs
tests/records.test.js
tests/e2e/app.spec.js
docs/assignment-checklist.md
```

## React 설계 설명

### 컴포넌트를 나눈 기준

페이지는 URL별 화면 구성과 탐색을 담당합니다. UI 컴포넌트는 반복되는 표시·상호작용을 담당하며 props를 통해 값을 받습니다. `RecordForm`은 등록·수정 양쪽에서 재사용하고, `RecordList`와 `RecordCard`는 대시보드·목록에서 재사용합니다.

prop을 받는 재사용 컴포넌트: `Button`, `Field`, `Badge`, `Icon`, `PageHeader`, `StatCard`, `RecordCard`, `RecordList`, `RecordForm`, `Loading`, `ErrorState`, `EmptyState`, `AsyncContent`, `ConfirmDialog`, `ToastProvider`.

### props와 state, 상태의 위치

| 상태                                  | 소유자                  | 이유                                |
| ------------------------------------- | ----------------------- | ----------------------------------- |
| 원격 데이터, 로딩, 실패, 재시도 번호  | `useRecords`            | 목록·상세 요청 흐름의 중복 제거     |
| 검색어, 주제, 상태 필터, 정렬         | `RecordsPage`           | 목록 화면만 사용하는 상태           |
| 입력값, 필드 오류, 제출 중, 요청 실패 | `RecordForm`            | 입력·검증·미리보기가 같은 값을 사용 |
| 삭제 확인 창, 삭제 중, 실패           | `RecordDetailPage`      | 해당 기록 삭제 흐름에만 필요        |
| 저장·삭제 성공 알림                   | `ToastProvider` Context | 페이지를 이동해도 알림이 유지       |

props는 부모가 전달하는 읽기 전용 입력이고 state는 컴포넌트가 상태 변경 함수로 관리하는 값입니다. 필터 결과, 통계, 미리보기 텍스트는 기존 값에서 계산합니다. 동일한 데이터를 별도 state에 중복 저장하지 않습니다. 서버 변경은 이벤트 핸들러에서 실행합니다.

### useEffect와 비동기 흐름

`useRecords(id)`의 effect 의존성은 `[id, revision]`입니다. 첫 마운트, 상세 ID 변경, 재시도 시 데이터를 다시 요청합니다. 요청 시작 시 `loading`, 성공 시 `success`, 실패 시 `error`로 전환합니다. 성공했지만 배열이 비었으면 페이지가 `EmptyState`를 표시합니다.

effect cleanup에서는 AbortController로 진행 중 조회를 중단하고 `active` 플래그로 이전 요청의 늦은 응답을 무시합니다. 개발 모드 StrictMode에서도 익명 계정 생성 요청은 하나의 Promise를 공유합니다. Supabase HTTP 요청에는 15초 제한을 두며 실패 후에는 화면의 재시도로 다시 요청할 수 있습니다.

### 이벤트 → 상태 → 렌더링

1. 검색·필터 클릭 → `RecordsPage` state 변경 → `useMemo`가 필터링·정렬 → 카드와 결과 개수 변경.
2. 폼 입력 → `values` 변경 → controlled input, 글자 수, 미리보기 변경.
3. 저장 클릭 → 검증 오류 또는 제출 중 state 변경 → 오류 메시지·버튼 비활성화 표시.
4. 저장 성공 → Context 알림 설정 → 상세로 이동하고 원격 데이터를 다시 조회.
5. 삭제 확인 → 원격 삭제 → 목록으로 이동하고 새 목록·빈 상태 표시.

등록·수정 실패 시 입력값을 유지합니다. 삭제 실패 시 확인 창과 원래 기록을 유지하며 재시도할 수 있습니다. 제출은 ref로 중복 실행도 방지합니다.

### 보너스 적용 범위

- 전역 상태: 성공 알림을 React Context로 관리.
- 메모이제이션: 목록 검색·필터·정렬에 `useMemo` 적용.
- 익명 Auth와 DB 접근 규칙은 적용. 이메일 로그인 화면과 보호 라우트는 구현하지 않았으므로 **인증 보너스 전체를 충족했다고 주장하지 않습니다.**

## 검증

```bash
npm test
npm run test:e2e
```

Windows의 E2E는 설치된 Microsoft Edge를 사용합니다. Edge가 없으면 `npx playwright install msedge`가 필요합니다. 다른 OS에서는 `npx playwright install chromium` 후 실행합니다. E2E 서버는 별도 포트 4174를 사용합니다.

E2E는 **Supabase HTTP 요청을 테스트 내부에서 가로채는 모의 API 검증**입니다. 앱 코드에 모의 저장소는 없습니다. 테스트 서버에는 가짜 테스트용 환경변수를 따로 전달하며 실제 프로젝트에 요청하지 않습니다.

검증 범위: CRUD 전체 흐름, 새로고침 후 재조회, 필수값 검증, 라이브 미리보기, 제출 중 버튼 상태, 저장·삭제 실패 및 재시도, 검색·필터·정렬, 로딩·오류·빈 상태, 없는 기록, 잘못된 주소, 모바일 가로 넘침, HTML 문자열의 안전한 텍스트 표시. 스크린샷은 Git에서 제외한 `test-results/`에 저장합니다.

### 실제 원격 검증

프로젝트 설정 후 다음을 실행합니다.

```bash
npm run test:remote
```

이 명령은 실제 Supabase에 익명 테스트 계정 2개와 임시 학습 기록을 만들고 CRUD 및 사용자 간 접근 제한을 검사합니다. 임시 기록은 종료 시 삭제하며, 익명 인증 계정은 Supabase Authentication에 남습니다. 사용자 기존 기록은 수정하지 않습니다. 자동 검증과 별도로 배포 URL의 실제 브라우저에서 같은 흐름을 확인해야 합니다.

## Vercel 배포

1. 검증한 코드를 GitHub 저장소에 올립니다.
2. Vercel에서 저장소를 Import하고 Vite 프로젝트로 설정합니다.
3. Build Command `npm run build`, Output Directory `dist`를 확인합니다.
4. Environment Variables에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`를 등록합니다. 사용할 Production/Preview 환경에 적용합니다.
5. Deploy합니다. 환경변수를 나중에 바꾸면 다시 빌드·배포합니다.
6. 배포 URL에서 등록 → 목록 → 상세 → 수정 → 새로고침 → 삭제 순서를 확인합니다.
7. 상세·수정 주소를 새 탭에서 직접 열고 새로고침해도 정상 표시되는지 확인합니다. `vercel.json`이 SPA 경로를 `index.html`로 연결합니다.
8. 배포 URL을 README 상단과 제출 문서에 추가합니다.

## 공식 참고 자료

- [React: Effect와 cleanup](https://react.dev/learn/synchronizing-with-effects)
- [React Router: 라우팅](https://reactrouter.com/start/declarative/routing)
- [Supabase: React 시작하기](https://supabase.com/docs/guides/getting-started/quickstarts/reactjs)
- [Supabase: 익명 로그인](https://supabase.com/docs/guides/auth/auth-anonymous)
- [Supabase: API 키](https://supabase.com/docs/guides/getting-started/api-keys)
- [Supabase: RLS](https://supabase.com/docs/guides/database/postgres/row-level-security)
