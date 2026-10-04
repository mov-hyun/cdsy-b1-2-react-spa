import PageHeader from '../components/PageHeader.jsx';
import RecordForm from '../components/RecordForm.jsx';

export default function NewRecordPage() {
  return (
    <>
      <PageHeader
        eyebrow="A NEW PAGE"
        title="새 기록 작성"
        description="오늘 배운 것 중 오래 기억하고 싶은 한 가지는 무엇인가요?"
      />
      <RecordForm />
    </>
  );
}
