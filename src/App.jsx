import { Route, Routes } from 'react-router';
import Layout from './components/Layout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RecordsPage from './pages/RecordsPage.jsx';
import RecordDetailPage from './pages/RecordDetailPage.jsx';
import NewRecordPage from './pages/NewRecordPage.jsx';
import EditRecordPage from './pages/EditRecordPage.jsx';
import GuidePage from './pages/GuidePage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardPage />} />
        <Route path="records" element={<RecordsPage />} />
        <Route path="records/new" element={<NewRecordPage />} />
        <Route path="records/:id" element={<RecordDetailPage />} />
        <Route path="records/:id/edit" element={<EditRecordPage />} />
        <Route path="guide" element={<GuidePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
