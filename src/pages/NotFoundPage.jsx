import { EmptyState } from '../components/States.jsx';

export default function NotFoundPage() {
  return (
    <div className="not-found">
      <p className="eyebrow">404 · PAGE NOT FOUND</p>
      <EmptyState
        title="아직 쓰이지 않은 페이지예요"
        description="주소를 확인하거나 대시보드에서 다시 시작해 주세요."
        action="대시보드로 돌아가기"
        to="/"
      />
    </div>
  );
}
