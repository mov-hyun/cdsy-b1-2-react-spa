# B1-2 요구사항 대응표

점검일: 2026-10-05. 실제 Supabase 연결 및 원격 CRUD·접근 제한 검증, Vercel 배포 환경의 실제 브라우저 CRUD 검증을 완료했습니다.

| 요구사항                       | 구현 근거                                 | 검증 상태                       |
| ------------------------------ | ----------------------------------------- | ------------------------------- |
| React 18 이상                  | React 19 / package-lock.json              | 빌드 통과                       |
| pages/components/hooks 분리    | src 폴더 구조                             | 확인                            |
| 공통 헤더 및 탐색              | Layout.jsx                                | E2E 확인                        |
| 5개 이상 라우트                | 정상 라우트 6개 + Not Found               | E2E 확인                        |
| 목록 및 파라미터 기반 상세     | RecordsPage, RecordDetailPage, useRecords | 모의 API E2E 통과               |
| prop을 받는 재사용 UI 8개 이상 | README 컴포넌트 목록                      | 15개 명시                       |
| controlled input               | RecordForm values + onChange              | E2E 확인                        |
| 목록/상세/로딩/오류 state      | useRecords                                | E2E 확인                        |
| 커스텀 훅                      | useRecords(id)                            | E2E 확인                        |
| 원격 CRUD                      | recordsApi.js → Supabase                  | 실제 원격 CRUD 및 RLS 검증 통과 |
| 필수값 검증 및 근접 오류       | validateRecord, Field                     | 단위/E2E 통과                   |
| 제출 중 표시 및 중복 방지      | busy state + inFlight ref                 | E2E 확인                        |
| 실패 표시 및 재시도            | ErrorState, 폼/삭제 오류                  | E2E 확인                        |
| 공통 로딩/오류/빈 UI           | States.jsx                                | E2E 확인                        |
| 상태→렌더링 3곳 이상           | 필터, 미리보기, 검증, 제출 중, 알림       | E2E 확인                        |
| 배포 URL에서 CRUD              | https://cdsy-b1-2-react-spa.vercel.app     | 실제 브라우저 CRUD 통과         |
| GitHub 소스 공유               | 지정 저장소 URL                           | main 반영 완료                  |
| README 실행 방법·스택          | README.md                                 | 작성                            |
| env 분리 및 Git 제외           | .env.example, .gitignore                  | 파일 규칙 확인, 커밋 전 재점검  |
| 보너스: 전역 상태              | ToastProvider Context                     | E2E 확인                        |
| 보너스: 메모이제이션           | RecordsPage useMemo                       | 적용                            |
| 보너스: 로그인+보호 라우트     | 익명 인증만 적용                          | 보너스 전체 미충족              |

## 실제 원격 및 배포 확인 시 기록할 항목

- [x] 새 Supabase 프로젝트와 schema.sql 적용
- [x] 익명 로그인 활성화
- [x] 실제 환경변수 설정
- [x] `npm run test:remote`: CRUD 및 다른 사용자 접근 차단
- [x] 로컬 실제 브라우저 등록·조회·수정·새로고침 후 유지 (삭제는 원격 API 검증)
- [x] GitHub 반영
- [x] 배포 URL 기록: https://cdsy-b1-2-react-spa.vercel.app
- [x] 배포 환경 CRUD 및 상세 주소 직접 접속·새로고침

API 키, 세션 토큰, 데이터베이스 비밀번호는 검증 기록에 남기지 않습니다.
