import Button from '../components/Button.jsx';
import Icon from '../components/Icon.jsx';
import StatCard from '../components/StatCard.jsx';
import RecordList from '../components/RecordList.jsx';
import { AsyncContent, EmptyState } from '../components/States.jsx';
import { useRecords } from '../hooks/useRecords.js';
import { filterRecords } from '../lib/records.js';

export default function DashboardPage() {
  const request = useRecords();
  return (
    <>
      <header className="welcome">
        <p className="eyebrow">YOUR LEARNING, ONE PAGE AT A TIME</p>
        <h1>오늘도 한 걸음, 배움노트</h1>
        <p className="muted">배운 것을 남기고, 쌓인 기록에서 성장을 발견해 보세요.</p>
      </header>
      <section className="hero">
        <div>
          <span className="hero-label">오늘의 작은 습관</span>
          <h2>
            배움은 짧게,
            <br />
            기억은 오래.
          </h2>
          <p>
            오늘 알게 된 한 가지를 적어 보세요.
            <br />한 줄의 기록도 충분한 시작이에요.
          </p>
          <Button to="/records/new">
            <Icon name="plus" size={18} />
            오늘의 배움 기록하기
          </Button>
        </div>
        <div className="notebook-art" aria-hidden="true">
          <div className="paper paper-back" />
          <div className="paper paper-front">
            <span className="paper-tag">TODAY I LEARNED</span>
            <div className="paper-title">작은 발견의 기록</div>
            <i />
            <i />
            <i />
            <span className="paper-check">✓ 오늘도 하나 배웠다!</span>
            <span className="paper-star">✳</span>
          </div>
          <span className="art-label">a little progress, every day.</span>
        </div>
      </section>
      <AsyncContent request={request}>
        {(records) => (
          <>
            <div className="stats-grid">
              <StatCard label="쌓인 기록" value={records.length} icon="book" />
              <StatCard
                label="복습할 기록"
                value={records.filter((record) => record.status === 'review').length}
                icon="clock"
                tone="amber"
              />
              <StatCard
                label="이해한 기록"
                value={records.filter((record) => record.status === 'done').length}
                icon="check"
                tone="green"
              />
            </div>
            <section>
              <div className="section-heading">
                <div>
                  <h2>최근의 배움</h2>
                  <p className="muted">차곡차곡 쌓이고 있는 나의 기록</p>
                </div>
                <Button to="/records" variant="quiet">
                  모든 기록 보기 <Icon name="arrow" size={17} />
                </Button>
              </div>
              {records.length ? (
                <RecordList records={filterRecords(records).slice(0, 3)} />
              ) : (
                <EmptyState action="첫 기록 남기기" to="/records/new" />
              )}
            </section>
          </>
        )}
      </AsyncContent>
    </>
  );
}
