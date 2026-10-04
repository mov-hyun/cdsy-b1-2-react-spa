import PageHeader from '../components/PageHeader.jsx';
import Button from '../components/Button.jsx';
import Icon from '../components/Icon.jsx';

export default function GuidePage() {
  return (
    <>
      <PageHeader
        eyebrow="MAKE YOURSELF AT HOME"
        title="배움노트 이용 안내"
        description="작은 배움을 오래 기억하는 나만의 공간입니다."
      />
      <div className="guide-grid">
        <section className="guide-card">
          <Icon name="edit" />
          <h2>1. 오늘의 배움 기록하기</h2>
          <p>
            제목과 배운 내용을 적고, 주제와 학습 날짜를 선택하세요. 옆의 미리보기에서 기록의 모습을
            확인할 수 있어요.
          </p>
        </section>
        <section className="guide-card">
          <Icon name="grid" />
          <h2>2. 다시 꺼내 보기</h2>
          <p>
            모든 기록에서 제목·내용을 검색하거나 주제와 상태로 모아 보세요. 카드를 누르면 자세한
            내용을 읽을 수 있어요.
          </p>
        </section>
        <section className="guide-card">
          <Icon name="check" />
          <h2>3. 이해가 깊어지면 갱신하기</h2>
          <p>
            상세 화면의 수정 버튼으로 내용과 상태를 바꿔 보세요. 필요 없는 기록은 확인 창을 거쳐
            삭제할 수 있어요.
          </p>
        </section>
      </div>
      <section className="guide-section">
        <h2>내 기록은 어디에 저장되나요?</h2>
        <p>
          기록은 Supabase 원격 데이터베이스에 저장됩니다. 처음 연결할 때 익명 학습 공간이
          만들어지고, 이 브라우저에 로그인 정보가 유지돼요. 다른 사용자의 기록은 열 수 없어요.
        </p>
        <p>
          <strong>
            브라우저 데이터를 지우거나 다른 기기·브라우저를 사용하면 기존 학습 공간에 접근할 수
            없습니다.
          </strong>{' '}
          과제용 학습 기록에 사용하고, 중요한 자료는 별도로 보관해 주세요.
        </p>
      </section>
      <section className="guide-section">
        <h2>연결 설정이 필요하다고 나오나요?</h2>
        <p>프로젝트 관리자가 새 Supabase 프로젝트를 만들고 다음 설정을 마치면 사용할 수 있어요.</p>
        <ol>
          <li>
            Supabase SQL Editor에서 저장소의 <code>supabase/schema.sql</code>을 실행합니다.
          </li>
          <li>Authentication 설정에서 Anonymous Sign-ins(익명 로그인)를 활성화합니다.</li>
          <li>
            <code>.env.example</code>을 <code>.env.local</code>로 복사하고 Project URL과 publishable
            key를 입력합니다.
          </li>
          <li>
            개발 서버를 다시 시작합니다. 배포 시에도 같은 환경변수를 등록하고 다시 배포합니다.
          </li>
        </ol>
        <p>자세한 설정과 검증 순서는 저장소 README에 있습니다.</p>
        <Button to="/" variant="secondary">
          대시보드로 이동 <Icon name="arrow" size={17} />
        </Button>
      </section>
    </>
  );
}
