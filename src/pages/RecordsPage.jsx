import { useMemo, useState } from 'react';
import Button from '../components/Button.jsx';
import Icon from '../components/Icon.jsx';
import PageHeader from '../components/PageHeader.jsx';
import RecordList from '../components/RecordList.jsx';
import { AsyncContent, EmptyState } from '../components/States.jsx';
import { useRecords } from '../hooks/useRecords.js';
import { TOPICS, STATUSES, filterRecords } from '../lib/records.js';

export default function RecordsPage() {
  const request = useRecords();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [topic, setTopic] = useState('all');
  const [sort, setSort] = useState('newest');
  // 목록이 달라지거나 필터가 바뀔 때만 필터링/정렬을 다시 계산한다.
  const filtered = useMemo(
    () => filterRecords(request.data ?? [], { query, status, topic, sort }),
    [request.data, query, status, topic, sort],
  );
  function reset() {
    setQuery('');
    setStatus('all');
    setTopic('all');
    setSort('newest');
  }
  return (
    <>
      <PageHeader
        eyebrow="MY JOURNAL"
        title="모든 기록"
        description="흩어져 있던 배움이 나만의 지식으로 쌓여요."
        action={
          <Button to="/records/new">
            <Icon name="plus" size={18} />새 기록 작성
          </Button>
        }
      />
      <div className="filter-panel">
        <div className="filter-top">
          <div className="search-box">
            <Icon name="search" />
            <label className="sr-only" htmlFor="search">
              기록 검색
            </label>
            <input
              id="search"
              type="search"
              placeholder="제목이나 내용으로 검색해 보세요"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <label className="sr-only" htmlFor="topic-filter">
            주제 필터
          </label>
          <select
            id="topic-filter"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          >
            <option value="all">모든 주제</option>
            {TOPICS.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </div>
        <div className="filter-bottom">
          <div className="filter-tabs" role="group" aria-label="학습 상태 필터">
            {[['all', { label: '전체' }], ...Object.entries(STATUSES)].map(([value, item]) => (
              <button key={value} aria-pressed={status === value} onClick={() => setStatus(value)}>
                {item.label}
              </button>
            ))}
          </div>
          <label className="sr-only" htmlFor="sort">
            정렬 순서
          </label>
          <select id="sort" value={sort} onChange={(event) => setSort(event.target.value)}>
            <option value="newest">학습일 최신순</option>
            <option value="oldest">학습일 오래된순</option>
          </select>
        </div>
      </div>
      <AsyncContent request={request}>
        {(records) => (
          <>
            <p className="result-count" role="status">
              총 <strong>{filtered.length}</strong>개의 기록
              {records.length !== filtered.length ? ` · 전체 ${records.length}개` : ''}
            </p>
            {filtered.length ? (
              <RecordList records={filtered} />
            ) : records.length ? (
              <EmptyState
                title="검색 결과가 없어요"
                description="다른 검색어나 필터로 다시 찾아보세요."
                action="필터 초기화"
                onAction={reset}
              />
            ) : (
              <EmptyState action="첫 기록 남기기" to="/records/new" />
            )}
          </>
        )}
      </AsyncContent>
    </>
  );
}
