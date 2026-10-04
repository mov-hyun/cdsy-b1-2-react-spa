import { useParams } from 'react-router';
import PageHeader from '../components/PageHeader.jsx';
import RecordForm from '../components/RecordForm.jsx';
import { AsyncContent, EmptyState } from '../components/States.jsx';
import { useRecords } from '../hooks/useRecords.js';

export default function EditRecordPage() {
  const { id } = useParams();
  const request = useRecords(id);
  return (
    <>
      <PageHeader
        eyebrow="KEEP GROWING"
        title="기록 수정"
        description="새롭게 이해한 내용을 더해 기록을 다듬어 보세요."
      />
      <AsyncContent request={request}>
        {(record) =>
          record ? (
            <RecordForm key={record.id} initialRecord={record} />
          ) : (
            <EmptyState
              title="기록을 찾을 수 없어요"
              description="삭제되었거나 이 학습 공간에 없는 기록입니다."
              action="목록으로 돌아가기"
              to="/records"
            />
          )
        }
      </AsyncContent>
    </>
  );
}
